import { Button } from "@/components/ui/button";
import { LucideIcon, Plus } from "lucide-react";

interface NoContentProps {
  icon: LucideIcon;
  title: string;
  titleDescription: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function NoContent({
  icon: Icon,
  title,
  titleDescription,
  buttonText,
  onButtonClick,
}: NoContentProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 relative mb-4">
        <Icon className="w-full h-full object-cover text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {titleDescription}
      </p>
      {buttonText && onButtonClick && (
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onButtonClick}
        >
          <Plus className="w-4 h-4" />
          {buttonText}
        </Button>
      )}
    </div>
  );
}
