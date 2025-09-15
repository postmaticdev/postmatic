import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { getMobileMargins } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface PrivacyDescription {
  type: "bold" | "text" | "list";
  content?: string;
  items?: string[];
}

interface PrivacySection {
  title: string;
  description: PrivacyDescription[];
}

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacyPolicy');
  const privacySections = t.raw('sections') as PrivacySection[];

  return (
    <main className="mx-auto ">
      <div className={cn("max-w-[60rem] mx-auto py-16", getMobileMargins())}>
        <h1 className="text-3xl font-bold mb-8 text-center">
          {t('title')}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-10">
          {t('lastUpdated')}
        </p>
        <Accordion type="single" collapsible className="w-full">
          {privacySections.map((section: PrivacySection, index: number) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {section.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm max-w-none">
                  {section.description.map((desc: PrivacyDescription, idx: number) => {
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
