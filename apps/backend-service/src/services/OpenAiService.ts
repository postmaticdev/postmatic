import OpenAI, { toFile, Uploadable } from "openai";
import { BaseService } from "./BaseService";
import { OPENAI_API_KEY } from "../constant/openai";
import fs from "fs";
import { ImageEditParams } from "openai/resources/images";
import { encoding_for_model } from "tiktoken";
import {
  BusinessKnowledge,
  ProductKnowledge,
  RoleKnowledge,
} from ".prisma/client";
import {
  ImageContentAdvancedGenerateDTO,
  ImageContentDTO,
  ImageContentMaskDTO,
  ImageContentRegenerateDTO,
  ImageContentRssDTO,
} from "src/validators/ImageContentValidator";
import {
  ChatCompletionContentPartText,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
} from "openai/resources/index";

export class OpenAiService extends BaseService {
  private static TOKEN_PER_IMAGE = 9000;

  constructor() {
    super();
  }

  private openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  /* ----------------------------- PUBLIC METHODS ---------------------------- */

  async generateCaption(params: GenerateCaptionParams) {
    const { body, business, images, product, role, rss, advancedGenerate } =
      params;

    const roleKnowledge = this.buildPromptRoleKnowledge(role, advancedGenerate);
    const businessKnowledge = this.buildPromptBusinessKnowledge(
      business,
      advancedGenerate
    );
    const productKnowledge = this.buildPromptProductKnowledge(
      product,
      advancedGenerate
    );

    const captionInstruction = this.buildCaptionInstruction({
      businessSummary: businessKnowledge,
      productSummary: productKnowledge,
      roleSummary: roleKnowledge,
      body,
      rss,
    });

    // messages multimodal: text + input_image[]
    const userContent = [
      { type: "text", text: captionInstruction },
      ...images.map((url) => ({
        type: "image_url",
        image_url: {
          url,
        },
      })),
    ];

    const messages: ChatCompletionCreateParamsNonStreaming["messages"] = [
      {
        role: "system",
        content:
          "Kamu adalah copywriter profesional sosial media berbahasa Indonesia.",
      },
      {
        role: "user",
        content: userContent as ChatCompletionContentPartText[],
      },
    ];

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
    });

    const inputTokens = encoding_for_model("gpt-4").encode(
      JSON.stringify(messages)
    ).length;
    const generated = response?.choices?.[0]?.message?.content?.trim() ?? "";
    const outputTokens = encoding_for_model("gpt-4").encode(generated).length;

    const fallbackUsage: OpenAI.Completions.CompletionUsage = {
      completion_tokens: 0,
      prompt_tokens: inputTokens,
      total_tokens: inputTokens + outputTokens,
      completion_tokens_details: {
        audio_tokens: 0,
        accepted_prediction_tokens: outputTokens,
        reasoning_tokens: 0,
        rejected_prediction_tokens: 0,
      },
      prompt_tokens_details: {
        audio_tokens: 0,
        cached_tokens: 0,
      },
    };

    // Hasil caption harus plain text (tanpa markdown, dll)
    const caption = generated;
    const usage: OpenAI.Completions.CompletionUsage =
      response?.usage ?? fallbackUsage;

    return { caption, usage };
  }

  async generateImages(params: GenerateImageParams): Promise<{
    image: string;
    usage: OpenAI.Images.ImagesResponse.Usage;
  }> {
    const {
      productImage,
      templateImage,
      logo,
      prompt: additionalPrompt,
      ratio,
      product,
      role,
      body,
      business,
      advancedGenerate,
    } = params;

    const attachLogo = advancedGenerate.businessKnowledge.logo;

    const images: Uploadable[] = [
      // PRODUCT IMAGE
      await toFile(fs.createReadStream(productImage), null, {
        type: "image/png",
      }),
    ];

    if (templateImage) {
      const templateImageFile = await toFile(
        fs.createReadStream(templateImage),
        null,
        { type: "image/png" }
      );
      images.push(templateImageFile);
    }

    if (attachLogo && logo) {
      const logoImage = await toFile(fs.createReadStream(logo), null, {
        type: "image/png",
      });
      images.push(logoImage);
    }

    const negative = this.buildNegativePrompt();
    const finalPrompt = this.buildKnowledgeDesignInstruction({
      body,
      business,
      product,
      role,
      advancedGenerate,
      additionalPrompt: additionalPrompt ?? "",
      // untuk bagian caption rule “jika ada reference image”
      hasReferenceImage: Boolean(body.referenceImage),
      extraNotes: negative,
    });

    const result = await this.openai.images.edit({
      model: "gpt-image-1",
      image: images,
      prompt: finalPrompt,
      size: this.getImageSize(ratio),
      quality: "high",
    });

    const base64Image = result?.data?.[0]?.b64_json ?? "";
    const textTokens = encoding_for_model("gpt-4").encode(finalPrompt).length;

    return {
      image: base64Image,
      usage: {
        input_tokens: textTokens,
        output_tokens: OpenAiService.TOKEN_PER_IMAGE,
        total_tokens: OpenAiService.TOKEN_PER_IMAGE + textTokens,
        input_tokens_details: {
          image_tokens: OpenAiService.TOKEN_PER_IMAGE,
          text_tokens: textTokens,
        },
      },
    };
  }

  async generateImageFromRss(params: GenerateImageRssParams): Promise<{
    image: string;
    usage: OpenAI.Images.ImagesResponse.Usage;
  }> {
    const {
      productImage,
      templateImage,
      logo,
      prompt: additionalPrompt,
      ratio,
      product,
      role,
      body,
      business,
      rssImage,
      rss,
      advancedGenerate,
    } = params;

    const attachLogo = advancedGenerate?.businessKnowledge?.logo;

    const images: Uploadable[] = [
      await toFile(fs.createReadStream(productImage), null, {
        type: "image/png",
      }),
    ];

    if (rssImage) {
      images.push(
        await toFile(fs.createReadStream(rssImage), null, {
          type: "image/png",
        })
      );
    }

    if (attachLogo && logo) {
      images.push(
        await toFile(fs.createReadStream(logo), null, { type: "image/png" })
      );
    }

    if (templateImage) {
      images.push(
        await toFile(fs.createReadStream(templateImage), null, {
          type: "image/png",
        })
      );
    }

    const negative = this.buildNegativePrompt();
    const rssPrompt = this.buildRssPrompt(rss);
    const finalPrompt = this.buildTrendDesignInstruction({
      body,
      business,
      product,
      role,
      advancedGenerate,
      rssSummaryBlock: rssPrompt,
      additionalPrompt: additionalPrompt ?? "",
      hasRssImage: Boolean(rssImage),
      extraNotes: negative,
    });

    const result = await this.openai.images.edit({
      model: "gpt-image-1",
      image: images,
      prompt: finalPrompt,
      size: this.getImageSize(ratio),
      quality: "high",
    });

    const base64Image = result?.data?.[0]?.b64_json ?? "";
    const textTokens = encoding_for_model("gpt-4").encode(finalPrompt).length;

    return {
      image: base64Image,
      usage: {
        input_tokens: textTokens,
        output_tokens: OpenAiService.TOKEN_PER_IMAGE,
        total_tokens: OpenAiService.TOKEN_PER_IMAGE + textTokens,
        input_tokens_details: {
          image_tokens: OpenAiService.TOKEN_PER_IMAGE,
          text_tokens: textTokens,
        },
      },
    };
  }

  async regenerateContent(params: RegenerateImageParams) {
    const { body, business, product, role, logo, advancedGenerate } = params;
    const attachLogo = advancedGenerate?.businessKnowledge?.logo;

    const businessPrompt = this.buildPromptBusinessKnowledge(
      business,
      advancedGenerate
    );
    const productPrompt = this.buildPromptProductKnowledge(
      product,
      advancedGenerate
    );
    const rolePrompt = this.buildPromptRoleKnowledge(role, advancedGenerate);

    const finalPrompt = this.buildRegenerateInstruction({
      body,
      businessSummary: businessPrompt,
      productSummary: productPrompt,
      roleSummary: rolePrompt,
    });

    const images: Uploadable[] = [
      await toFile(fs.createReadStream(body.image), null, {
        type: "image/png",
      }),
    ];

    if (attachLogo && logo) {
      images.push(
        await toFile(fs.createReadStream(logo), null, {
          type: "image/png",
        })
      );
    }

    const result = await this.openai.images.edit({
      model: "gpt-image-1",
      image: images,
      prompt: finalPrompt,
      size: this.getImageSize(body.ratio),
      quality: "high",
    });

    const base64Image = result?.data?.[0]?.b64_json ?? "";
    const textTokens = encoding_for_model("gpt-4").encode(finalPrompt).length;

    return {
      image: base64Image,
      usage: {
        input_tokens: textTokens,
        output_tokens: OpenAiService.TOKEN_PER_IMAGE,
        total_tokens: OpenAiService.TOKEN_PER_IMAGE + textTokens,
        input_tokens_details: {
          image_tokens: OpenAiService.TOKEN_PER_IMAGE,
          text_tokens: textTokens,
        },
      },
    };
  }

  async maskContent(params: MaskImageParams) {
    const { mask, body, referenceImage } = params;
    const { prompt } = body;

    const images: Uploadable[] = [
      await toFile(fs.createReadStream(referenceImage), "base.png", {
        type: "image/png",
      }),
    ];

    const maskImage = await toFile(fs.createReadStream(mask), "mask.png", {
      type: "image/png",
    });

    const finalPrompt = this.buildMaskInstruction(prompt);

    const result = await this.openai.images.edit({
      model: "gpt-image-1",
      image: images,
      prompt: finalPrompt,
      mask: maskImage,
      quality: "high",
      size: this.getImageSize(body.ratio),
    });

    const base64Image = result?.data?.[0]?.b64_json ?? "";
    const textTokens = encoding_for_model("gpt-4").encode(finalPrompt).length;

    return {
      image: base64Image,
      usage: {
        input_tokens: textTokens,
        output_tokens: OpenAiService.TOKEN_PER_IMAGE,
        total_tokens: OpenAiService.TOKEN_PER_IMAGE + textTokens,
        input_tokens_details: {
          image_tokens: OpenAiService.TOKEN_PER_IMAGE,
          text_tokens: textTokens,
        },
      },
    };
  }

  /* ------------------------------ PROMPT BUILDERS ------------------------------ */

  private buildNegativePrompt(): string {
    return `
NEGATIVE PROMPT (hindari):
- Teks yang tidak diminta atau watermark
- Gambar pecah/buram/noisy/low-quality
- Crop aneh, proporsi salah, atau komposisi tidak seimbang
- Warna yang terlalu oversaturated atau pencahayaan tidak realistis
- Distorsi pada logo atau tipografi
`;
  }

  private buildCaptionInstruction(args: {
    businessSummary: string;
    productSummary: string;
    roleSummary: string;
    body: ImageContentDTO;
    rss: ImageContentRssDTO["rss"] | null;
  }): string {
    const { businessSummary, productSummary, roleSummary, body, rss } = args;

    // Sesuai “Generate Caption” + “jika ada rss sesuaikan”
    return `
TUGAS:
Anda adalah seorang copywriter profesional yang mampu menulis caption menarik BERBAHASA INDONESIA untuk gambar yang dilampirkan.

KONTEKS:
${this.buildPromptImageContent(body)}
${businessSummary}
${productSummary}
${roleSummary}
${rss ? this.buildRssPrompt(rss) : ""}

ATURAN PENTING:
- Output hanya CAPTION (tanpa judul, tanpa markdown, tanpa penjelasan).
- Gunakan tone (Tone) dan gaya (Persona) dari Role Knowledge.
- Sertakan CTA (Call To Action) yang jelas dan singkat.
- Jika Role Knowledge menyediakan daftar hashtags, JANGAN mengubahnya. Tambahkan hashtags relevan lain untuk engagement.
- Gambarkan isi gambar secara singkat agar relevan dengan tujuan (Goals) dan audiens.
${
  rss
    ? "- Jika RSS ada, kaitkan insight/topik RSS secara relevan ke caption."
    : ""
}

BAHASA:
- Pastikan seluruh caption dalam Bahasa Indonesia.
`.trim();
  }

  private buildKnowledgeDesignInstruction(args: {
    body: ImageContentDTO;
    business: Partial<BusinessKnowledge>;
    product: Partial<ProductKnowledge>;
    role: Partial<RoleKnowledge>;
    advancedGenerate: ImageContentAdvancedGenerateDTO;
    additionalPrompt: string;
    hasReferenceImage: boolean;
    extraNotes: string;
  }): string {
    const {
      body,
      business,
      product,
      role,
      advancedGenerate,
      additionalPrompt,
      hasReferenceImage,
      extraNotes,
    } = args;

    const businessSummary = this.buildPromptBusinessKnowledge(
      business,
      advancedGenerate
    );
    const productSummary = this.buildPromptProductKnowledge(
      product,
      advancedGenerate
    );
    const roleSummary = this.buildPromptRoleKnowledge(role, advancedGenerate);
    const contentSummary = this.buildPromptImageContent(body);

    // Sesuai "Generate Image by Knowledge"
    return `
PERAN:
Anda adalah seorang desainer profesional sosial media.

TUJUAN:
Membuat ulang desain referensi dengan aspect ratio ${
      body.ratio
    } (default 1:1 bila tidak tersedia) dan style “${
      body.designStyle ?? "vintage"
    }”. 
Identifikasi seluruh elemen desain referensi (layout, warna, tipografi, bentuk, icon/pattern, dekorasi).
Ganti elemen yang relevan dengan ${
      product.name ?? "produk saya"
    } dan logo bisnis yang disediakan (jika diaktifkan).
Tingkatkan kualitas gambar & pencahayaan agar jernih, tajam, dan profesional untuk sosial media.

KONTEKS:
${contentSummary}
${businessSummary}
${productSummary}
${roleSummary}

ATURAN:
- Pertahankan komposisi visual agar harmonis & estetis.
- Logo bisnis ditempatkan proporsional dan tidak terdistorsi.
- Gunakan penyesuaian warna/kontras agar produk terlihat menonjol.
- Hindari menambahkan teks baru kecuali sangat diperlukan untuk estetika.
${extraNotes}

${
  hasReferenceImage
    ? `CATATAN TAMBAHAN (Reference Image tersedia):
- Setelah visual final dibuat, siapkan konten agar mudah di-caption-kan oleh copywriter (caption akan dibuat terpisah berdasarkan Business/Role).`
    : ""
}

PROMPT TAMBAHAN (opsional dari user):
${additionalPrompt || "N/A"}
`.trim();
  }

  private buildTrendDesignInstruction(args: {
    body: ImageContentDTO;
    business: Partial<BusinessKnowledge>;
    product: Partial<ProductKnowledge>;
    role: Partial<RoleKnowledge>;
    advancedGenerate: ImageContentAdvancedGenerateDTO;
    rssSummaryBlock: string;
    additionalPrompt: string;
    hasRssImage: boolean;
    extraNotes: string;
  }): string {
    const {
      body,
      business,
      product,
      role,
      advancedGenerate,
      rssSummaryBlock,
      additionalPrompt,
      hasRssImage,
      extraNotes,
    } = args;

    const businessSummary = this.buildPromptBusinessKnowledge(
      business,
      advancedGenerate
    );
    const productSummary = this.buildPromptProductKnowledge(
      product,
      advancedGenerate
    );
    const roleSummary = this.buildPromptRoleKnowledge(role, advancedGenerate);
    const contentSummary = this.buildPromptImageContent(body);

    // Sesuai "Generate by Trend (RSS)"
    return `
PERAN:
Anda adalah seorang desainer profesional sosial media.

TUJUAN:
Membuat ulang desain referensi dengan aspect ratio ${body.ratio} dan style “${
      body.designStyle ?? "vintage"
    }”.
Identifikasi seluruh elemen desain referensi.
Ganti elemen yang relevan dengan ${
      product.name ?? "produk saya"
    } + logo bisnis (jika diaktifkan).
Tambahkan "Rangkuman Trend RSS" sebagai elemen/visualisasi/cocoklogi SEHINGGA related namun tidak merusak desain asli.
Tingkatkan kualitas gambar & pencahayaan agar jernih, tajam, dan profesional.

KONTEKS:
${contentSummary}
${businessSummary}
${productSummary}
${roleSummary}

TREND (RSS):
${rssSummaryBlock}
${
  hasRssImage
    ? "- Gambar RSS terlampir, gunakan secara kreatif tanpa merusak komposisi."
    : ""
}

ATURAN:
- Pertahankan keseimbangan komposisi; elemen trend harus subtil & relevan.
- Integrasikan elemen trend (ikon, warna, shape, pattern) secara elegan.
- Hindari teks panjang dari RSS; gunakan simbol/ikon/visual analogy.
${extraNotes}

PROMPT TAMBAHAN (opsional dari user):
${additionalPrompt || "N/A"}
`.trim();
  }

  private buildRegenerateInstruction(args: {
    body: ImageContentRegenerateDTO & { image: string; ratio: ValidRatio };
    businessSummary: string;
    productSummary: string;
    roleSummary: string;
  }): string {
    const { body, businessSummary, productSummary, roleSummary } = args;

    return `
PERAN:
Anda adalah editor gambar profesional sosial media.

TUGAS:
Edit gambar terlampir sesuai instruksi pengguna.

KONTEKS:
Design Style: ${body.designStyle ?? "Default"}
Ratio: ${body.ratio}
${businessSummary}
${productSummary}
${roleSummary}

INSTRUKSI PENGGUNA (PALING PENTING):
${body.prompt || "N/A"}

ATURAN:
- Terapkan perubahan sesuai prompt pengguna secara presisi.
- Jika "attach logo" tidak diaktifkan dan gambar sumber tidak ada logo, jangan tambahkan logo.
- Jaga kualitas, hindari blur/noise, dan pertahankan estetika sosial media.
`.trim();
  }

  private buildMaskInstruction(userPrompt: string): string {
    // Mask independent dari knowledge — keep it focused & strong
    return `
PERAN:
Anda adalah editor gambar profesional.

TUGAS:
Edit HANYA area transparan pada mask (alpha=0) dari gambar dasar. Area putih (opaque) harus dipertahankan.

INSTRUKSI PENGGUNA:
${userPrompt}

ATURAN:
- Jaga konsistensi pencahayaan & bayangan.
- Hindari artefak, noise, atau distorsi.
- Jangan mengubah area putih/tertutup mask.
- Hasil akhir tajam, bersih, dan siap pakai untuk sosial media.
`.trim();
  }

  private buildRssPrompt(params: ImageContentRssDTO["rss"]): string {
    const { publishedAt, summary, title, url, publisher, imageUrl } = params;

    return `
RSS SUMMARY:
- Judul: ${title}
- URL: ${url}
- Gambar: ${imageUrl ? `${imageUrl} (attached)` : "N/A"}
- Terbit: ${publishedAt}
- Publisher: ${publisher}
- Ringkasan: ${summary}
`.trim();
  }

  /* ------------------------------ KNOWLEDGE BLOCKS ----------------------------- */

  private buildPromptProductKnowledge(
    product: Partial<ProductKnowledge>,
    advancedGenerate: ImageContentAdvancedGenerateDTO
  ): string {
    const { category, currency, description, name, price } = product;

    const {
      attachProductCategory,
      attachProductDescription,
      attachProductName,
      attachProductPrice,
    } = this.buildAttachAdvancedGenerate(advancedGenerate).productKnowledge;

    return `
PRODUCT KNOWLEDGE (filtered):
${attachProductName && name ? `- Name: ${name}` : ""}
${
  attachProductDescription && description ? `- Description: ${description}` : ""
}
${attachProductCategory && category ? `- Category: ${category}` : ""}
${
  attachProductPrice && typeof price === "number"
    ? `- Price: ${currency ?? ""} ${price}`
    : ""
}

CATATAN:
- Pakai hanya detail yang RELEVAN dengan referensi/template.
- Jika tidak tersedia, gunakan informasi generik secukupnya.
`.trim();
  }

  private buildPromptRoleKnowledge(
    role: Partial<RoleKnowledge>,
    advancedGenerate: ImageContentAdvancedGenerateDTO
  ): string {
    const {
      audiencePersona,
      callToAction,
      goals,
      hashtags,
      targetAudience,
      tone,
    } = role;

    const { attachRoleHashtags } =
      this.buildAttachAdvancedGenerate(advancedGenerate).roleKnowledge;

    return `
ROLE KNOWLEDGE:
${audiencePersona ? `- Persona: ${audiencePersona}` : ""}
${callToAction ? `- CTA: ${callToAction}` : ""}
${goals ? `- Goals: ${goals}` : ""}
${
  attachRoleHashtags && hashtags?.length
    ? `- Hashtags (fixed): ${hashtags.map((h) => `#${h}`).join(", ")}`
    : ""
}
${targetAudience ? `- Target Audience: ${targetAudience}` : ""}
${tone ? `- Tone: ${tone}` : ""}

CATATAN:
- Gunakan jika relevan dengan referensi/purpose.
`.trim();
  }

  private buildPromptImageContent(body: ImageContentDTO): string {
    const { category, designStyle, ratio } = body;

    return `
IMAGE CONTENT:
${category ? `- Category: ${category}` : ""}
${designStyle ? `- Design Style: ${designStyle}` : ""}
${ratio ? `- Ratio: ${ratio}` : ""}

CATATAN:
- Perlakukan ini sebagai constraint utama desain.
`.trim();
  }

  private buildPromptBusinessKnowledge(
    business: Partial<BusinessKnowledge>,
    advancedGenerate: ImageContentAdvancedGenerateDTO
  ): string {
    const {
      category,
      description,
      location,
      name,
      uniqueSellingPoint,
      visionMission,
      website,
    } = business;

    const {
      attachBusinessCategory,
      attachBusinessDescription,
      attachBusinessName,
      attachBusinessUniqueSellingPoint,
      attachBusinessVisionMission,
      attachBusinessWebsite,
      attachBusinessLocation,
    } = this.buildAttachAdvancedGenerate(advancedGenerate).businessKnowledge;

    return `
BUSINESS KNOWLEDGE (filtered):
${attachBusinessName && name ? `- Name: ${name}` : ""}
${
  attachBusinessDescription && description
    ? `- Description: ${description}`
    : ""
}
${attachBusinessCategory && category ? `- Category: ${category}` : ""}
${attachBusinessLocation && location ? `- Location: ${location}` : ""}
${
  attachBusinessUniqueSellingPoint && uniqueSellingPoint
    ? `- USP: ${uniqueSellingPoint}`
    : ""
}
${
  attachBusinessVisionMission && visionMission
    ? `- Vision/Mission: ${visionMission}`
    : ""
}
${attachBusinessWebsite && website ? `- Website: ${website}` : ""}

CATATAN:
- Gunakan sebagai konteks, hanya bila relevan dengan tujuan.
`.trim();
  }

  private buildRegeneratePrompt(data: ImageContentRegenerateDTO): string {
    const { designStyle, prompt, advancedGenerate } = data;
    const attachLogo = advancedGenerate?.businessKnowledge?.logo;
    return `
User want to edit the attached image with the following information:
- Design Style: ${designStyle ?? "Default"}
- Attach Logo: ${attachLogo ? "Yes" : "No"} 
- User Prompt: ${prompt ?? "N/A"}

NOTE:
- Apply only changes relevant to the user prompt.
- Keep the rest consistent and aesthetic for social media.
    `.trim();
  }

  private buildAttachAdvancedGenerate(
    advancedGenerate: ImageContentAdvancedGenerateDTO
  ) {
    const {
      category: attachBusinessCategory,
      description: attachBusinessDescription,
      logo,
      name: attachBusinessName,
      uniqueSellingPoint: attachBusinessUniqueSellingPoint,
      visionMission: attachBusinessVisionMission,
      website: attachBusinessWebsite,
      location: attachBusinessLocation,
    } = advancedGenerate.businessKnowledge;

    const attachBusinessLogo = logo;

    const {
      name: attachProductName,
      description: attachProductDescription,
      category: attachProductCategory,
      price: attachProductPrice,
    } = advancedGenerate.productKnowledge;

    const { hashtags: attachRoleHashtags } = advancedGenerate.roleKnowledge;

    return {
      businessKnowledge: {
        attachBusinessCategory,
        attachBusinessDescription,
        attachBusinessLogo,
        attachBusinessName,
        attachBusinessUniqueSellingPoint,
        attachBusinessVisionMission,
        attachBusinessWebsite,
        attachBusinessLocation,
      },
      productKnowledge: {
        attachProductName,
        attachProductDescription,
        attachProductCategory,
        attachProductPrice,
      },
      roleKnowledge: {
        attachRoleHashtags,
      },
    };
  }

  /* --------------------------------- UTILS --------------------------------- */

  getTokenUsage(
    items:
      | OpenAI.Images.ImagesResponse.Usage[]
      | OpenAI.Completions.CompletionUsage[]
  ): number {
    return items.reduce((acc, item) => item.total_tokens + acc, 0);
  }

  private getImageSize(ratio?: ValidRatio): ImageEditParams["size"] {
    switch (ratio) {
      case "1:1":
        return "1024x1024";
      case "2:3":
        return "1024x1536";
      case "3:2":
        return "1536x1024";
      default:
        return "1024x1024";
    }
  }
}

/* ------------------------------- TYPE DEFINITIONS ------------------------------ */

interface GenerateImageParams {
  productImage: string; // path to product image
  templateImage: string; // path to template image
  logo: string | null; // path to logo image
  prompt: string | null; // custom prompt for image generation
  ratio: ValidRatio;
  product: Partial<ProductKnowledge>;
  role: Partial<RoleKnowledge>;
  body: ImageContentDTO;
  business: Partial<BusinessKnowledge>;
  advancedGenerate: ImageContentAdvancedGenerateDTO;
}

interface GenerateImageRssParams {
  productImage: string; // path to product image
  templateImage: string; // path to template image
  logo: string | null; // path to logo image
  rssImage: string; // path to rss image
  prompt: string | null; // custom prompt for image generation
  ratio: ValidRatio;
  product: Partial<ProductKnowledge>;
  role: Partial<RoleKnowledge>;
  body: ImageContentDTO;
  business: Partial<BusinessKnowledge>;
  rss: ImageContentRssDTO["rss"];
  advancedGenerate: ImageContentAdvancedGenerateDTO;
}

export type ValidRatio = "1:1" | "2:3" | "3:2";

interface GenerateCaptionParams {
  images: string[]; // url
  body: ImageContentDTO;
  business: Partial<BusinessKnowledge>;
  product: Partial<ProductKnowledge>;
  role: Partial<RoleKnowledge>;
  rss: ImageContentRssDTO["rss"] | null;
  advancedGenerate: ImageContentAdvancedGenerateDTO;
}

interface RegenerateImageParams {
  body: ImageContentRegenerateDTO & { image: string; ratio: ValidRatio };
  logo: string | null; // path to logo image
  product: Partial<ProductKnowledge>;
  role: Partial<RoleKnowledge>;
  business: Partial<BusinessKnowledge>;
  advancedGenerate: ImageContentAdvancedGenerateDTO;
}

interface MaskImageParams {
  referenceImage: string; // path to reference image
  mask: string; // path to mask image
  body: ImageContentMaskDTO;
}
