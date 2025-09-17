import { Search } from "lucide-react";

interface SearchNotFoundProps {
  description: string;
}

export function SearchNotFound({ description }: SearchNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Search className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        Tidak ada hasil ditemukan
      </h3>
      <p className="text-sm text-muted-foreground">
       Coba kata kunci lain  {description}  
      </p>
    </div>
  );
}
