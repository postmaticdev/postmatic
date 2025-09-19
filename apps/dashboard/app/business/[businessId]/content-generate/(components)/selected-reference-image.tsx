import { useContentGenerate } from "@/contexts/content-generate-context";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const SelectedReferenceImage = () => {
  const { form, selectedHistory, isLoading } = useContentGenerate();
  const imageHistory =
    selectedHistory?.result?.images[0] ||
    selectedHistory?.input?.referenceImage;

  if (
    !form?.basic?.referenceImage ||
    form.basic.referenceImage === imageHistory
  )
    return null;
  return (
    <Card className="p-4" id="selected-reference-image">
      <div className="space-y-3">
        <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden relative">
          <Image
            src={form.basic.referenceImage}
            alt={form.basic.referenceImageName || ""}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div>
          <h3 className="font-medium text-sm">Referensi Digunakan</h3>
          <p className="text-xs text-gray-600 mt-1">
            {form.basic.referenceImageName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() =>
              form.setBasic({
                ...form.basic,
                referenceImage: null,
                referenceImageName: null,
              })
            }
            disabled={isLoading}
          >
            Ganti Referensi
          </Button>
        </div>
      </div>
    </Card>
  );
};
