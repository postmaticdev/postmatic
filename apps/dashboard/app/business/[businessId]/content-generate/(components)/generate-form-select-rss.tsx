import { NoContent } from "@/components/base/no-content";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/constants";
import { useContentGenerate } from "@/contexts/content-generate-context";
import { dateFormat } from "@/helper/date-format";
import { useRssKnowledgeGetById } from "@/services/knowledge.api";
import { ChartNoAxesCombined } from "lucide-react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

export const GenerateFormSelectRss = () => {
  const { businessId } = useParams() as { businessId: string };
  const { data: rssData } = useRssKnowledgeGetById(businessId, {
    sortBy: "title",
    sort: "asc",
  });

  const rss = rssData?.data.data || [];

  const { rssArticles, form, isLoading } = useContentGenerate();
  const router = useRouter();
  if (form.rss) return null;

  const handleNavigateToRssModal = () => {
    router.push(`/business/${businessId}/knowledge-base?openRssModal=true#rss-trend-section`);
  };
  const handleNavigateToRss = () => {
    router.push(`/business/${businessId}/knowledge-base#rss-trend-section`);
  };
  return (
    <>
      {rssArticles.length === 0 && rss.length === 0 ? (
        <NoContent
          icon={ChartNoAxesCombined}
          title="Tidak ada artikel RSS yang ditemukan"
          titleDescription="Tambahkan RSS dahulu"
          buttonText="Tambah RSS"
          onButtonClick={handleNavigateToRssModal}
        />
      ) : rss.length >= 0 && rssArticles.length === 0 && (
        <NoContent
          icon={ChartNoAxesCombined}
          title="Tidak ada artikel RSS yang aktif"
          titleDescription="Aktifkan atau tambahkan RSS dahulu"
          buttonText="Aktifkan RSS"
          onButtonClick={handleNavigateToRss}
        />
      )}


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rssArticles.map((article, index) => (
          <Card
            key={`${article?.imageUrl}:${index}`}
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              {/* Article Image */}
              <div className="w-full h-48 rounded-lg overflow-hidden relative">
                <Image
                  src={article.imageUrl || DEFAULT_PLACEHOLDER_IMAGE}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Article Content */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm line-clamp-2 leading-relaxed flex-1 pr-2 ">
                  {article.title}
                </h3>
                <span className="text-xs mb-1 text-muted-foreground whitespace-nowrap">
                  {dateFormat.indonesianDate(new Date(article.publishedAt))}{" "}
                  {dateFormat.getHhMm(new Date(article.publishedAt))}
                </span>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
              </div>

              {/* Use Button */}
              <Button
                onClick={() =>
                  form.onRssSelect({
                    imageUrl: article.imageUrl,
                    publishedAt: article.publishedAt,
                    publisher: article.publisher,
                    summary: article.summary,
                    title: article.title,
                    url: article.url,
                  })
                }
                disabled={!!form.rss || isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                Use
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
};
