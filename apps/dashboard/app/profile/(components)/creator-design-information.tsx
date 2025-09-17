"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DesignTemplate {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  image: string;
  tag?: string;
}

interface CreatorDesignInformationProps {
  templates?: DesignTemplate[];
}

export function CreatorDesignInformation({
 
}: CreatorDesignInformationProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter templates based on search query

  return (
    <Card>
      <CardContent className="py-6 relative">
      <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
          COMING SOON
        </div>
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Informasi Desain Kreator
          </h2>
    

        {/* Search and Create Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search the reference here..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            disabled
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Buat Baru
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card
              key={i}
              className="group transition-all duration-300 hover:scale-105 bg-card border-border shadow-sm  cursor-pointer"
            >
              <CardContent className="py-4 md:py-6">
                <div className="space-y-3">
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
