import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { getMobileMargins } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function CookiePolicyPage() {
  const cookieSections = [
    {
      title: "What Are Cookies?",
      content: [
        {
          type: "text",
          text: "Cookies are small text files placed on your device when you visit a website. They help us operate the site, enhance your experience, analyze traffic, and serve relevant advertisements.",
        },
      ],
    },
    {
      title: "How We Use Cookies",
      content: [
        {
          type: "text",
          text: "We use cookies for the purposes described below. You can control non-essential cookies via our Cookie Settings modal at any time.",
        },
      ],
    },
    {
      title: "Categories of Cookies We Use",
      content: [
        {
          type: "list",
          items: [
            "<strong>1. Necessary Cookies (Always Active)</strong><br/>Essential for basic website functionality, security, and network management. Without these, services such as logging in or filling forms cannot be provided.",
            "<strong>2. Analytics Cookies</strong><br/>Collect information in aggregate—such as number of visitors, pages viewed, and session duration—to help us understand how the site is used and improve performance.",
            "<strong>3. Marketing / Advertising Cookies</strong><br/>Track visitors across websites to display relevant, personalized ads and measure the effectiveness of our marketing campaigns.",
          ],
        },
      ],
    },
    {
      title: "Third-Party Cookies",
      content: [
        {
          type: "text",
          text: "We may allow trusted third-party services (e.g., Google Analytics, Meta Pixel) to set cookies for analytics or marketing purposes. These providers are contractually bound to handle data responsibly and in accordance with applicable law.",
        },
      ],
    },
    {
      title: "Managing Your Cookie Preferences",
      content: [
        {
          type: "text",
          text: "When you first visit Postmatic, you will see a cookie-consent banner. You may:",
        },
        {
          type: "list",
          items: [
            "Accept all cookies;",
            "Reject all optional cookies;",
            "Open “Cookie Settings” to choose individual categories.",
          ],
        },
        {
          type: "text",
          text: "You can revisit or change your choices at any time by clicking the “Cookie Settings” link in the footer or by clearing local storage and refreshing the page.",
        },
      ],
    },
    {
      title: "Data Retention",
      content: [
        {
          type: "text",
          text: "Cookie retention periods vary by category: necessary cookies expire after the session or within 30 days; analytics cookies may persist up to 24 months; marketing cookies are typically retained for 6–12 months or until you revoke consent.",
        },
      ],
    },
    {
      title: "Contact Us",
      content: [
        {
          type: "text",
          text: "If you have any questions about this Cookie Policy, please contact us:",
        },
        {
          type: "list",
          items: [
            "<strong>Email:</strong> <a href='mailto:team@postmatic.id' class='text-blue-600 underline'>team@postmatic.id</a>",
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
          Cookie Policy
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-10">
          Last updated: August 06, 2025
        </p>

        <Accordion type="single" collapsible className="w-full">
          {cookieSections.map((section, idx) => (
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
                        <ul key={i} className="list-disc pl-6 space-y-2">
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