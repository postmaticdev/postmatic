import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"; // ganti dengan sesuai path
import { getMobileMargins } from "@/lib/utils";
import { cn } from "@/lib/utils";
export default function PrivacyPolicyPage() {
  const privacySections = [
    {
      title: "Interpretation and Definitions",
      description: [
        {
          type: "bold",
          content: "Interpretation",
        },
        {
          type: "text",
          content:
            "The words of which the initial letter is capitalized have meanings defined under the following conditions.",
        },
        {
          type: "bold",
          content: "Definitions",
        },
        {
          type: "list",
          items: [
            "**Account**: a unique account created for You to access our Service.",
            "**Company** (“Postmatic”, “We”, “Us”, “Our”): Jl. Lempongsari No.353, Indonesia.",
            "**Personal Data**: any information relating to an identified or identifiable individual.",
            "**Service**: the Website accessible from https://postmatic.id",
            "**Usage Data**: automatically collected data (IP address, browser, pages visited, etc.).",
            "**Cookies**: small files placed on Your device to store browsing details.",
            "**Third-Party Social Media Services**: Google, Facebook, Instagram, Twitter, LinkedIn.",
            "**You**: the individual or legal entity using the Service.",
          ],
        },
      ],
    },
    {
      title: "Collecting and Using Your Personal Data",
      description: [
        {
          type: "bold",
          content: "Types of Data Collected",
        },
        {
          type: "list",
          items: [
            "**Personal Data**: email, first/last name, phone number, address, city, province, ZIP, usage data.",
            "**Usage Data**: IP address, browser type/version, time stamps, device info, diagnostic data.",
            "**Third-Party Social Media**: If You register via Google, Facebook, Instagram, Twitter, or LinkedIn, We may collect Your name, email, activities, and contact list.",
            "**Tracking Technologies & Cookies**: Necessary / Essential Cookies (Session), Cookie Notice Acceptance Cookies (Persistent), Functionality Cookies (Persistent)",
          ],
        },
      ],
    },
    {
      title: "Use of Your Personal Data",
      description: [
        {
          type: "text",
          content: "We may use Your Personal Data to:",
        },
        {
          type: "list",
          items: [
            "Provide and maintain the Service.",
            "Manage Your Account and registration.",
            "Perform a contract (e.g., purchases).",
            "Contact You by email, phone, SMS, push notifications.",
            "Send news, offers, and general information (unless You opt out).",
            "Manage Your requests.",
            "Evaluate or conduct business transfers (merger, sale, etc.).",
            "Conduct data analysis, measure campaign effectiveness, improve products/services.",
          ],
        },
      ],
    },
    {
      title: "Retention of Your Personal Data",
      description: [
        {
          type: "text",
          content:
            "We retain Personal Data only as long as necessary for the purposes set out in this Privacy Policy (legal obligations, dispute resolution, policy enforcement).",
        },
        {
          type: "text",
          content:
            "Usage Data is generally retained for shorter periods unless used for security or functionality improvements.",
        },
      ],
    },
    {
      title: "Transfer of Your Personal Data",
      description: [
        {
          type: "text",
          content:
            "Your information may be transferred to — and maintained on — computers located outside Your jurisdiction where data protection laws may differ.",
        },
        {
          type: "text",
          content:
            "We take all reasonable steps to ensure Your data is treated securely and in accordance with this Privacy Policy.",
        },
      ],
    },
    {
      title: "Delete Your Personal Data",
      description: [
        {
          type: "text",
          content:
            "You have the right to delete or request assistance in deleting Personal Data We have collected about You.",
        },
        {
          type: "text",
          content:
            "You may update, amend, or delete Your information via Your Account settings or by contacting Us at team@postmatic.id",
        },
        {
          type: "text",
          content: "We may retain certain information when required by law.",
        },
      ],
    },
    {
      title: "Disclosure of Your Personal Data",
      description: [
        {
          type: "bold",
          content: "Business Transactions",
        },
        {
          type: "text",
          content:
            "If the Company is involved in a merger, acquisition, or asset sale, Your Personal Data may be transferred. Notice will be provided before Your data becomes subject to a different privacy policy.",
        },
        {
          type: "bold",
          content: "Law Enforcement",
        },
        {
          type: "text",
          content:
            "We may disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities.",
        },
        {
          type: "bold",
          content: "Other Legal Requirements",
        },
        {
          type: "text",
          content:
            "We may disclose Your Personal Data in the good-faith belief that such action is necessary to comply with a legal obligation, protect rights or property, prevent wrongdoing, protect user safety, or defend against legal liability.",
        },
      ],
    },
    {
      title: "Security of Your Personal Data",
      description: [
        {
          type: "text",
          content:
            "No method of transmission over the Internet or electronic storage is 100% secure, but We strive to use commercially acceptable means to protect Your Personal Data.",
        },
      ],
    },
    {
      title: "Children's Privacy",
      description: [
        {
          type: "text",
          content:
            "Our Service does not address anyone under the age of 13. We do not knowingly collect Personal Data from children under 13. If You believe Your child has provided Us with Personal Data, please contact Us. We will remove such information from Our servers.",
        },
      ],
    },
    {
      title: "Links to Other Websites",
      description: [
        {
          type: "text",
          content:
            "Our Service may contain links to third-party sites. We assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.",
        },
      ],
    },
    {
      title: "Changes to this Privacy Policy",
      description: [
        {
          type: "text",
          content:
            "We may update this Privacy Policy from time to time. Changes are effective when posted on this page. We will notify You via email and/or a prominent notice on the Service prior to the change becoming effective and update the “Last updated” date.",
        },
      ],
    },
    {
      title: "Contact Us",
      description: [
        {
          type: "text",
          content:
            "If You have any questions about this Privacy Policy, contact us:",
        },
        {
          type: "list",
          items: [
            "**Email**: team@postmatic.id",
            "**Website**: https://postmatic.id",
          ],
        },
      ],
    },
  ];

  return (
    <main className="mx-auto ">
      <div className={cn("max-w-[60rem] mx-auto py-16", getMobileMargins())}>
        <h1 className="text-3xl font-bold mb-8 text-center">
          Privacy Policy for Postmatic
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-10">
          Last updated: July 02, 2025
        </p>
        <Accordion type="single" collapsible className="w-full">
          {privacySections.map((section, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {section.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm max-w-none">
                  {section.description.map((desc, idx) => {
                    switch (desc.type) {
                      case "bold":
                        return (
                          <p key={idx}>
                            <strong>{desc.content}</strong>
                          </p>
                        );
                      case "text":
                        return (
                          <div
                            key={idx}
                            dangerouslySetInnerHTML={{
                              __html: desc!.content!,
                            }}
                          />
                        );
                      case "list":
                        return (
                          <ul key={idx} className="list-disc pl-6">
                            {desc.items &&
                              desc.items.map((item: string, i: number) => (
                                <li
                                  key={i}
                                  dangerouslySetInnerHTML={{
                                    __html: item.replace(
                                      /\*\*(.*?)\*\*/g,
                                      "<strong>$1</strong>"
                                    ),
                                  }}
                                />
                              ))}
                          </ul>
                        );
                      default:
                        return null;
                    }
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
