import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useContentGenerate } from "@/contexts/content-generate-context";
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/constants";
import Link from "next/link";
import { useState } from "react";

export const SelectedArticleRss = () => {
  const { form, isLoading } = useContentGenerate();
  const [expanded, setExpanded] = useState(false);
  if (!form?.rss) return null;
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden relative">
          <Image
            src={form.rss.imageUrl || DEFAULT_PLACEHOLDER_IMAGE}
            alt={form.rss.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div>
          <h3 className="font-medium text-sm">{form.rss.title}</h3>
          <div className="relative">
            <p className={`text-xs text-muted-foreground mt-1 ${!expanded ? "line-clamp-10" : ""}`}>
              {form.rss.summary}
            </p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs  mt-1 flex items-center"
            >
              {expanded ? (
                <>
                  Tampilkan lebih pendek <ChevronUp className="h-3 w-3 ml-1" />
                </>
              ) : (
                <>
                  Tampilkan lebih panjang <ChevronDown className="h-3 w-3 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => form.onRssSelect(null)}
            disabled={isLoading}
          >
            Ganti Berita
          </Button>
          <Link href={form.rss.url} prefetch={false} target="_blank">
            <Button
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs"
            >
              Kunjungi Sumber
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
