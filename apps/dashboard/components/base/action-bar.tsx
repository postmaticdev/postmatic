"use client";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export function ActionBar() {
  const router = useRouter();
  const [searchState, setSearchState] = useState("");
  const handleNewBusiness = () => {
    router.push("/business/new-business");
  };

  useDebounce(
    () => {
      callbackSearch(searchState);
    },
    500,
    [searchState]
  );

  const callbackSearch = (val: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    setSearchState(val);
    searchParams.set("search", val);
    router.push(`/business?${searchParams.toString()}`);
  };

  return (
    <div className="p-6 border-b border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center  gap-4">
        <Button
          onClick={handleNewBusiness}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Buat Bisnis Baru
        </Button>

        <div className="w-full sm:flex-1">
          <div className="w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Cari bisnis"
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
              className="pl-10 bg-muted/50 border-muted-foreground/20 focus:border-blue-500 w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

