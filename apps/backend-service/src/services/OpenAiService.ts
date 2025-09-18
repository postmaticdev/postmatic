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
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources/index";

export class OpenAiService extends BaseService {
  private static TOKEN_PER_IMAGE = 9000;

  constructor() {
    super();
  }
  private openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

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

    const messages: ChatCompletionCreateParamsNonStreaming["messages"] = [
      {
        role: "system",
        content: `You are a social media content creator. 
        You will generate a caption for the image based on the provided body, business, and product information.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Generate a caption for the following images: ${images.join(
              ", "
            )}.
            
            There are knowledge about the business, product, and body that you can use to generate the caption.
            Use the following information to generate the caption:
            Body (From User Request): ${JSON.stringify(body)}. 
            Business Knowledge: ${businessKnowledge}. 
            Product Knowledge: ${productKnowledge}.
            Role Knowledge: ${roleKnowledge}.
            ${rss ? `Rss: ${JSON.stringify(rss)}` : ""}
            
            Note:
            - Make sure to use the RELEVANT business knowledge, product knowledge, and body information to generate the caption to RELEVANT PURPOSE OF THE IMAGE.
            - Make sure to use the product name, business name, and body information to generate
            - Make output in a concise and engaging manner.
            - Make sure to use the tone and style that is suitable for the target audience.
            - If in role knowledge there are a hashtags, make sure to use it, and never change it. Then make a additional hashtags that are relevant to the product and business and improve Social Media engagement (IMPORTANT).
            - Make sure to use the additional hashtags that are relevant to the product and business and improve Social Media engagement (IMPORTANT).
            - Use EVERYTHING IN ROLE KNOWLEDGE TO GENERATE THE CAPTION (IMPORTANT).
            - OUTPUT ONLY FOR THE CAPTION, DO NOT INCLUDE ANY OTHER TEXT OR MARKDOWN OR ANY OTHER INFORMATION.
            - MAKE SURE CAPTION IS IN "BAHASA INDONESIA"
            ${
              rss
                ? "- Make sure to use the RELEVANT rss knowledge to generate the caption to RELEVANT PURPOSE OF THE IMAGE."
                : ""
            }
            `,
            ...images.map((url) => ({ type: "input_image", image_url: url })),
          },
        ],
      },
    ];
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
    });

    const inputTokens = encoding_for_model("gpt-4").encode(
      JSON.stringify(messages)
    ).length;
    const outputTokens = encoding_for_model("gpt-4").encode(
      response?.choices?.[0]?.message?.content?.trim() || ""
    ).length;

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

    const caption = response?.choices?.[0]?.message?.content?.trim() || "";
    const usage: OpenAI.Completions.CompletionUsage =
      response?.usage || fallbackUsage;

    return { caption, usage };
  }

  /**
   * Generates a promotional image using OpenAI's image editing model.
   * @param params Parameters for generating the image.
   * @param params.productImage The product image URL.
   * @param params.templateImage The template image URL.
   * @param params.logoImage The logo image URL.
   * @param params.productName The name of the product to be displayed in the image.
   * @param params.additionalPrompt Additional prompt to provide to the OpenAI model.
   * @param params.ratio The aspect ratio of the output image. Should be one of 1:1, 7:4, 4:7.
   * @returns A promise that resolves to an object containing the generated image and its usage.
   */
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
    const images: Uploadable[] = await Promise.all([
      // PRODUCT IMAGE
      toFile(fs.createReadStream(productImage), null, {
        type: "image/png",
      }),
    ]);

    if (templateImage) {
      // TEMPLATE IMAGE
      const templateImageFile = await toFile(
        fs.createReadStream(templateImage),
        null,
        {
          type: "image/png",
        }
      );
      images.push(templateImageFile);
    }

    if (attachLogo && logo) {
      const logoImage = await toFile(fs.createReadStream(logo), null, {
        type: "image/png",
      });
      images.push(logoImage);
    }

    const NEGATIVE_PROMPT =
      "No text, no cropped images, no blurry, no low quality";

    const finalPrompt = `
    ${this.buildPromptBusinessKnowledge(business, advancedGenerate)}
    
    ${this.buildPromptProductKnowledge(product, advancedGenerate)}

    ${this.buildPromptImageContent(body)}

    NEGATIVE PROMPT: 
    ${NEGATIVE_PROMPT} 

    Create a ${body.category} image for the product "${
      product.name
    }" using the provided template and logo. 
    The product should be prominently featured in the center of the image, with the template providing a professional background. 
    The logo "${
      business.name
    } should be placed in well-placed areas of the image.
    Ensure the image is visually appealing and suitable for social media sharing.
    Make sure to follow the design style and ratio specified in the image content.
    Use the product knowledge and role knowledge to create a compelling image that resonates with the target audience
    and aligns with the brand's identity.
    Use the provided product image, template image, and logo image to create the promotional image.
    Use the provided ratio to create the image with the correct aspect ratio.
    Use the provided additional prompt (if available) to create the image with the correct context and purpose.

    IMPORTANT NOTE:
    - Business knowledges are everything about the business
    - Product knowledges are everything about the product
    
    ADDITIONAL PROMPT: 
    ${additionalPrompt ? additionalPrompt : "N/A"}`;

    // Step 2: Call OpenAI image edit
    const result = await this.openai.images.edit({
      model: "gpt-image-1",
      image: images,
      prompt: finalPrompt,
      size: this.getImageSize(ratio),
      quality: "high",
    });

    const base64Image = result?.data?.[0]?.b64_json;
    return {
      image: base64Image || "",
      usage: {
        input_tokens: encoding_for_model("gpt-4").encode(finalPrompt).length,
        output_tokens: OpenAiService.TOKEN_PER_IMAGE,
        total_tokens:
          OpenAiService.TOKEN_PER_IMAGE +
          encoding_for_model("gpt-4").encode(finalPrompt).length,
        input_tokens_details: {
          image_tokens: OpenAiService.TOKEN_PER_IMAGE,
          text_tokens: encoding_for_model("gpt-4").encode(finalPrompt).length,
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

    const images: Uploadable[] = await Promise.all([
      // PRODUCT IMAGE
      toFile(fs.createReadStream(productImage), null, {
        type: "image/png",
      }),
    ]);

    if (rssImage) {
      const rssImageFile = await toFile(fs.createReadStream(rssImage), null, {
        type: "image/png",
      });
      images.push(rssImageFile);
    }

    if (attachLogo && logo) {
      const logoImage = await toFile(fs.createReadStream(logo), null, {
        type: "image/png",
      });
      images.push(logoImage);
    }

    if (templateImage) {
      const templateImageFile = await toFile(
        fs.createReadStream(templateImage),
        null,
        {
          type: "image/png",
        }
      );
      images.push(templateImageFile);
    }

    const NEGATIVE_PROMPT =
      "No text, no cropped images, no blurry, no low quality";

    const finalPrompt = `
    ${this.buildPromptBusinessKnowledge(business, advancedGenerate)}
    
    ${this.buildPromptProductKnowledge(product, advancedGenerate)}

    ${this.buildPromptImageContent(body)}

    ${this.buildRssPrompt(rss)}

    NEGATIVE PROMPT: 
    ${NEGATIVE_PROMPT} 

    Create a ${body.category} image for the product "${
      product.name
    }" using the provided template and logo. 
    The product should be prominently featured in the center of the image, with the template providing a professional background. 
    The logo "${
      business.name
    } should be placed in well-placed areas of the image.
    Ensure the image is visually appealing and suitable for social media sharing.
    Make sure to follow the design style and ratio specified in the image content.
    Use the product knowledge and role knowledge to create a compelling image that resonates with the target audience
    and aligns with the brand's identity.
    Use the provided product image, template image, and logo image to create the promotional image.
    Use the provided ratio to create the image with the correct aspect ratio.
    Use the provided additional prompt (if available) to create the image with the correct context and purpose.
    Make more attention in typography (use professional typography, fonts, etc.)
    Make sure the content are related to the RSS feed ("${rss.title}").
    Make sure you are "PROFESSIONAL IMAGE EDITOR FOR SOCIAL MEDIA".
    You are allowed to be creative with the image.
    ${
      rssImage
        ? "Use the provided RSS image to create the promotional image"
        : ""
    }.
    
    ADDITIONAL PROMPT: 
    ${additionalPrompt ? additionalPrompt : "N/A"}`;

    // Step 2: Call OpenAI image edit
    const result = await this.openai.images.edit({
      model: "gpt-image-1",
      image: images,
      prompt: finalPrompt,
      size: this.getImageSize(ratio),
      quality: "high",
    });

    const base64Image = result?.data?.[0]?.b64_json;
    return {
      image: base64Image || "",
      usage: {
        input_tokens: encoding_for_model("gpt-4").encode(finalPrompt).length,
        output_tokens: OpenAiService.TOKEN_PER_IMAGE,
        total_tokens:
          OpenAiService.TOKEN_PER_IMAGE +
          encoding_for_model("gpt-4").encode(finalPrompt).length,
        input_tokens_details: {
          image_tokens: OpenAiService.TOKEN_PER_IMAGE,
          text_tokens: encoding_for_model("gpt-4").encode(finalPrompt).length,
        },
      },
    };
  }

  private buildRssPrompt(params: ImageContentRssDTO["rss"]) {
    const { publishedAt, summary, title, url, publisher, imageUrl } = params;

    return `
    **RSS DATA**
    Title: ${title}
    URL: ${url}
    Image URL: ${imageUrl ? `${imageUrl} (Attached)` : "N/A"}
    Published At: ${publishedAt}
    Publisher: ${publisher}
    Summary: ${summary}
    `;
  }

  async regenerateContent(params: RegenerateImageParams) {
    const { body, business, product, role, logo, advancedGenerate } = params;
    const attachLogo = advancedGenerate?.businessKnowledge?.logo;
    const bodyPrompt = this.buildRegeneratePrompt(body);
    const businessPrompt = this.buildPromptBusinessKnowledge(
      business,
      advancedGenerate
    );
    const productPrompt = this.buildPromptProductKnowledge(
      product,
      advancedGenerate
    );
    const finalPrompt = `
      ${businessPrompt}

      ${productPrompt}

      ${bodyPrompt}
    `;

    const images: Uploadable[] = await Promise.all([
      toFile(fs.createReadStream(body.image), null, {
        type: "image/png",
      }),
    ]);

    if (attachLogo && logo) {
      const logoImage = await toFile(fs.createReadStream(logo), null, {
        type: "image/png",
      });
      images.push(logoImage);
    }

    const result = await this.openai.images.edit({
      model: "gpt-image-1",
      image: images,
      prompt: finalPrompt,
      size: this.getImageSize(body.ratio),
      quality: "high",
    });

    const base64Image = result?.data?.[0]?.b64_json;
    return {
      image: base64Image,
      usage: {
        input_tokens: encoding_for_model("gpt-4").encode(finalPrompt).length,
        output_tokens: OpenAiService.TOKEN_PER_IMAGE,
        total_tokens:
          OpenAiService.TOKEN_PER_IMAGE +
          encoding_for_model("gpt-4").encode(finalPrompt).length,
        input_tokens_details: {
          image_tokens: OpenAiService.TOKEN_PER_IMAGE,
          text_tokens: encoding_for_model("gpt-4").encode(finalPrompt).length,
        },
      },
    };
  }

  async maskContent(params: MaskImageParams) {
    const { mask, body, referenceImage } = params;
    const { prompt } = body;

    const images: Uploadable[] = await Promise.all([
      toFile(fs.createReadStream(referenceImage), "base.png", {
        type: "image/png",
      }),
    ]);

    const maskImage = await toFile(fs.createReadStream(mask), "mask.png", {
      type: "image/png",
    });

    const result = await this.openai.images.edit({
      model: "gpt-image-1",
      image: images,
      prompt: prompt,
      mask: maskImage,
      quality: "high",
    });

    const base64Image = result?.data?.[0]?.b64_json;
    return {
      image: base64Image,
      usage: {
        input_tokens: encoding_for_model("gpt-4").encode(prompt).length,
        output_tokens: OpenAiService.TOKEN_PER_IMAGE,
        total_tokens:
          OpenAiService.TOKEN_PER_IMAGE +
          encoding_for_model("gpt-4").encode(prompt).length,
        input_tokens_details: {
          image_tokens: OpenAiService.TOKEN_PER_IMAGE,
          text_tokens: encoding_for_model("gpt-4").encode(prompt).length,
        },
      },
    };
  }

  private buildPromptProductKnowledge(
    product: Partial<ProductKnowledge>,
    advancedGenerate: ImageContentAdvancedGenerateDTO
  ) {
    const { category, currency, description, name, price } = product;

    const {
      attachProductCategory,
      attachProductDescription,
      attachProductName,
      attachProductPrice,
    } = this.buildAttachAdvancedGenerate(advancedGenerate).productKnowledge;
    return `
    PRODUCT KNOWLEDGE:
    ${attachProductName && name ? `Product Name: ${name}` : ""}
    ${
      attachProductDescription && description
        ? `Description: ${description}`
        : ""
    }
    ${attachProductCategory && category ? `Category: ${category}` : ""}
    ${attachProductPrice && price ? `${currency || ""} ${price}` : ""}
 
    PRODUCT KNOWLEDGE NOTE:
    - Make sure to use this information if available and relevant with reference image / template
    - If not available, use generic product information.
    - If the product is a service, use generic service information.
    - If the product is a digital product, use generic digital product information.
    - If the product is a physical product, use generic physical product information.
    - If the product is a food product, use generic food product information.
    - If the product is a beverage, use generic beverage product information.
    - If the product is a cosmetic, use generic cosmetic product information.
    - If the product is a fashion item, use generic fashion product information.
    - If the product is a technology item, use generic technology product information.
    - If the product is a home item, use generic home product information. etc.
    `;
  }

  private buildPromptRoleKnowledge(
    role: Partial<RoleKnowledge>,
    advancedGenerate: ImageContentAdvancedGenerateDTO
  ) {
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
    ${audiencePersona ? `Audience Persona: ${audiencePersona}` : ""}
    ${callToAction ? `Call to Action: ${callToAction}` : ""}
    ${goals ? `Goals: ${goals}` : ""}
    ${
      attachRoleHashtags && hashtags
        ? `Hashtags: ${hashtags?.map((hashtag) => `#${hashtag}`).join(", ")}`
        : ""
    }
    ${targetAudience ? `Target Audience: ${targetAudience}` : ""}
    ${tone ? `Tone: ${tone}` : ""}

    ROLE KNOWLEDGE NOTE:
    - Make sure to use this information if available and relevant with reference image / template and purpose of the image generation.
    - If not available, use generic role information.
    `;
  }

  private buildPromptImageContent(body: ImageContentDTO) {
    const { category, designStyle, ratio } = body;

    return `
    IMAGE CONTENT:
    ${category ? `Category: ${category}` : ""}
    ${designStyle ? `Design Style: ${designStyle}` : ""}
    ${ratio ? `Ratio: ${ratio}` : ""}

    IMAGE CONTENT NOTE:
    - Make this as specific as possible to the image content user want.
    - Make this as a important rules to follow when generating the image.
    `;
  }

  private buildPromptBusinessKnowledge(
    business: Partial<BusinessKnowledge>,
    advancedGenerate: ImageContentAdvancedGenerateDTO
  ) {
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
    BUSINESS KNOWLEDGE:
    ${attachBusinessName && name ? `Business Name: ${name}` : ""}
    ${
      attachBusinessDescription && description
        ? `Description: ${description}`
        : ""
    }
    ${attachBusinessCategory && category ? `Category: ${category}` : ""}
    ${attachBusinessLocation && location ? `Location: ${location}` : ""}
    ${
      attachBusinessUniqueSellingPoint && uniqueSellingPoint
        ? `Unique Selling Point: ${uniqueSellingPoint}`
        : ""
    }
    ${
      attachBusinessVisionMission && visionMission
        ? `Vision and Mission: ${visionMission}`
        : ""
    }
    ${attachBusinessWebsite && website ? `Website: ${website}` : ""}

    BUSINESS KNOWLEDGE NOTE:
    - Make sure to use this information if relevant with purposes.
    - Make this information as a context to generate the image.
    `;
  }

  private buildRegeneratePrompt(data: ImageContentRegenerateDTO) {
    const { designStyle, prompt, advancedGenerate } = data;
    const attachLogo = advancedGenerate?.businessKnowledge?.logo;
    return `
    User want to edit the attached image with the following information:
    Design Style: ${designStyle}
    User want to attach logo: ${
      attachLogo ? "Yes" : "No"
    } (if "No" and in image attached there is no logo, don't attach logo)
    User Prompt: ${prompt}

    **NOTE**:
    - Make sure to use this information if relevant with purposes.
    - Make this information as a context to generate the image.
    - Don't generate anything out of "User Prompt" context.
    - Use the "Knowledge" Context that relevant with "User Prompt".
    - "User Prompt" is the most important context to generate the image.
    `;
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

  /**
   * Utility to calculate token usage (not used here but included)
   */
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

interface GenerateImageParams {
  productImage: string; //path to product image
  templateImage: string; //path to template image
  logo: string | null; //path to logo image
  prompt: string | null; // custom prompt for image generation
  ratio: ValidRatio;
  product: Partial<ProductKnowledge>;
  role: Partial<RoleKnowledge>;
  body: ImageContentDTO;
  business: Partial<BusinessKnowledge>;
  advancedGenerate: ImageContentAdvancedGenerateDTO;
}

interface GenerateImageRssParams {
  productImage: string; //path to product image
  templateImage: string; //path to template image
  logo: string | null; //path to logo image
  rssImage: string; //path to rss image
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
  images: string[]; //url
  body: ImageContentDTO;
  business: Partial<BusinessKnowledge>;
  product: Partial<ProductKnowledge>;
  role: Partial<RoleKnowledge>;
  rss: ImageContentRssDTO["rss"] | null;
  advancedGenerate: ImageContentAdvancedGenerateDTO;
}

interface RegenerateImageParams {
  body: ImageContentRegenerateDTO & { image: string; ratio: ValidRatio };
  logo: string | null; //path to logo image
  product: Partial<ProductKnowledge>;
  role: Partial<RoleKnowledge>;
  business: Partial<BusinessKnowledge>;
  advancedGenerate: ImageContentAdvancedGenerateDTO;
}

interface MaskImageParams {
  referenceImage: string; //path to reference image
  mask: string; //path to mask image
  body: ImageContentMaskDTO;
}
