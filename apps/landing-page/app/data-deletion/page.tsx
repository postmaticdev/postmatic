import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { getMobileMargins } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function DataDeletionPage() {
  const deletionSections = [
    {
      title: "Data Deletion Request Procedure",
      content: [
        {
          type: "list",
          items: [
            "<strong>1. Request Submission</strong><br/>Send an email to <a href='mailto:team@postmatic.id'>team@postmatic.id</a> with the subject “Data Deletion Request.” Include your full name, registered email, phone number, and an optional brief explanation of the request.",
            "<strong>2. Identity Verification</strong><br/>We’ll email you a confirmation message. Reply promptly to verify your identity.",
            "<strong>3. Processing Time</strong><br/>Once verified, we’ll complete the deletion within 7–14 business days and notify you via email.",
          ],
        },
      ],
    },
    {
      title: "Data Deletion Scope",
      content: [
        {
          type: "list",
          items: [
            "Personal identification information (name, email, phone number)",
            "All project-related data and knowledge-base content",
            "Generated images, videos, captions, and any stored media",
            "Connected social-media tokens and credentials (invalidated immediately)",
            "Chat / reply automation configurations and chat histories",
          ],
        },
      ],
    },
    {
      title: "Exceptions",
      content: [
        {
          type: "text",
          text: "Some data may be retained for legal, regulatory, or compliance purposes:",
        },
        {
          type: "list",
          items: [
            "Transactional records for tax & financial reporting (retained per legal mandates)",
            "Anonymized analytical data for internal reporting & performance analysis",
          ],
        },
      ],
    },
    {
      title: "Subscription & Payment Information",
      content: [
        {
          type: "text",
          text: "Payment and subscription data handled by <strong>Midtrans</strong> are governed by their own privacy policy. To delete that information, contact Midtrans directly via their official channels.",
        },
      ],
    },
    {
      title: "Post-Deletion Access",
      content: [
        {
          type: "text",
          text: "After deletion is complete, you will no longer be able to access any projects, generated content, or services tied to your account.",
        },
      ],
    },
    {
      title: "Contact Us",
      content: [
        {
          type: "text",
          text: "Questions? Email us at <a href='mailto:team@postmatic.id'>team@postmatic.id</a>.",
        },
      ],
    },
  ];

  return (
    <main className="mx-auto">
      <div className={cn("max-w-[60rem] mx-auto py-16", getMobileMargins())}>
        <h1 className="text-3xl font-bold mb-8 text-center">
          Data Deletion Policy
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-10">
          Last updated: August 06, 2025
        </p>

        <Accordion type="single" collapsible className="w-full">
          {deletionSections.map((section, idx) => (
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
                        <ul key={i} className="list-disc pl-6 space-y-1">
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