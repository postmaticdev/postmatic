import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"; // adjust path if needed
import { getMobileMargins } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function TermsOfServicePage() {
  const tocSections = [
    {
      title: "Acceptance of Terms",
      content: [
        {
          type: "text",
          text: "By accessing or using the Postmatic Service (“Postmatic,” “we,” or “our”), you agree to abide by these Terms & Conditions (“Terms”). If you do not agree with any part of these Terms, you must not access or use the Service.",
        },
      ],
    },
    {
      title: "Registration and Account Security",
      content: [
        {
          type: "list",
          items: [
            "You must provide accurate and complete information when registering an account (including name, email, phone number, and password).",
            "You are responsible for safeguarding your account credentials and for all activities that occur under your account.",
          ],
        },
      ],
    },
    {
      title: "Services Provided",
      content: [
        {
          type: "list",
          items: [
            "Social media content automation through AI-generated images, videos, and captions.",
            "Automatic posting capabilities to connected social media accounts.",
            "AI-powered automated chat and reply functionalities.",
          ],
        },
      ],
    },
    {
      title: "User Responsibilities",
      content: [
        {
          type: "list",
          items: [
            "You must ensure that all business-related information provided (such as logos, brand names, descriptions, product details, and pricing) is accurate, lawful, and does not infringe upon intellectual property rights.",
            "You agree to adhere to the terms and policies of any third-party social media platforms integrated with Postmatic.",
          ],
        },
      ],
    },
    {
      title: "Intellectual Property",
      content: [
        {
          type: "list",
          items: [
            "Postmatic retains all intellectual property rights in the Service, including AI-generated content templates, software, and algorithms.",
            "Users maintain ownership of the business-related information and content they provide or upload to Postmatic.",
          ],
        },
      ],
    },
    {
      title: "Subscription and Payment",
      content: [
        {
          type: "list",
          items: [
            "Postmatic utilizes a token-based subscription model.",
            "Payments are securely processed via <strong>Midtrans</strong>.",
            "Tokens purchased are non-refundable and subject to expiration as outlined during the purchase process.",
          ],
        },
      ],
    },
    {
      title: "Prohibited Uses",
      content: [
        {
          type: "text",
          text: "You agree not to:",
        },
        {
          type: "list",
          items: [
            "Use Postmatic for any unlawful, fraudulent, or malicious purpose.",
            "Interfere with or disrupt the functionality, performance, or security of Postmatic.",
            "Upload or generate content that is harmful, threatening, abusive, defamatory, obscene, offensive, or otherwise objectionable.",
          ],
        },
      ],
    },
    {
      title: "Data Privacy",
      content: [
        {
          type: "text",
          text: "Postmatic processes personal and business data according to our Privacy Policy. By using Postmatic, you consent to the collection and use of data analytics to enhance our service quality.",
        },
      ],
    },
    {
      title: "Limitation of Liability",
      content: [
        {
          type: "text",
          text: "Postmatic shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of profits or revenues, incurred directly or indirectly through the use of the Service.",
        },
      ],
    },
    {
      title: "Indemnification",
      content: [
        {
          type: "text",
          text: "You agree to indemnify, defend, and hold harmless Postmatic from any claims, damages, liabilities, costs, or expenses resulting from your use of the Service or violation of these Terms.",
        },
      ],
    },
    {
      title: "Changes to Terms",
      content: [
        {
          type: "text",
          text: "Postmatic reserves the right to modify these Terms at any time. Users will be informed of changes via email or through notifications on our website. Continued use after notification signifies your acceptance of the updated Terms.",
        },
      ],
    },
    {
      title: "Termination",
      content: [
        {
          type: "text",
          text: "Postmatic reserves the right to suspend or terminate your access to the Service without prior notice if you violate any provisions of these Terms.",
        },
      ],
    },
    {
      title: "Governing Law",
      content: [
        {
          type: "text",
          text: "These Terms & Conditions shall be governed by and interpreted in accordance with the laws of the Republic of Indonesia.",
        },
      ],
    },
    {
      title: "Contact Information",
      content: [
        {
          type: "text",
          text: "For any inquiries regarding these Terms, please contact us at:",
        },
        {
          type: "list",
          items: [
            "<strong>Email:</strong> team@postmatic.id",
            "<strong>Website:</strong> <a href='https://postmatic.id' target='_blank' rel='noopener noreferrer' class='text-blue-600 underline'>https://postmatic.id</a>",
          ],
        },
      ],
    },
  ];

  return (
    <main className="mx-auto">
      <div className={cn("max-w-[60rem] mx-auto py-16", getMobileMargins())}>
        <h1 className="text-3xl font-bold mb-8 text-center">
          Terms & Conditions
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-10">
          Last updated: August 06, 2025
        </p>

        <Accordion type="single" collapsible className="w-full">
          {tocSections.map((section, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left">
                {section.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm max-w-none">
                  {section.content.map((block, i) => {
                    if (block.type === "text") {
                      return (
                        <p
                          key={i}
                          dangerouslySetInnerHTML={{ __html: block.text! }}
                        />
                      );
                    }
                    if (block.type === "list") {
                      return (
                        <ul key={i} className="list-disc pl-6">
                          {block.items!.map((li, k) => (
                            <li
                              key={k}
                              dangerouslySetInnerHTML={{
                                __html: li.replace(
                                  /\*\*(.*?)\*\*/g,
                                  "<strong>$1</strong>"
                                ),
                              }}
                            />
                          ))}
                        </ul>
                      );
                    }
                    return null;
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </main>
  );
}