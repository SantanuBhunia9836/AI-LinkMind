"use client";

import { useState, useMemo } from "react";
import { LinkCard } from "./link-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Inbox } from "lucide-react";
import type { SavedLink } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

type LinkLibraryProps = {
  links: SavedLink[];
  onDelete: (id: string) => void;
};

export function LinkLibrary({ links, onDelete }: LinkLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const dynamicCategories = useMemo(() => {
    const categories = new Set(links.map(link => link.category));
    return ["All", ...Array.from(categories).sort()];
  }, [links]);

  const filteredLinks = useMemo(() => {
    return links
      .filter((link) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          link.title.toLowerCase().includes(search) ||
          link.description.toLowerCase().includes(search) ||
          link.url.toLowerCase().includes(search);
        
        const matchesCategory = filterCategory === "All" || link.category === filterCategory;
        
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [links, searchTerm, filterCategory]);
  
    return (
      <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search titles, descriptions, or URLs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
            aria-label="Search links"
          />
        </div>
        <div className="md:hidden flex">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filter
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filter Links</SheetTitle>
                <SheetDescription>
                  Apply filters to narrow down your link library.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full h-11" aria-label="Filter by category">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[200px]">
                    {dynamicCategories.map(cat => (
                      <SelectItem key={cat} value={cat} className="cursor-pointer py-2.5">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </SheetContent>
          </Sheet>
          </div>
         <Select value={filterCategory} onValueChange={setFilterCategory}>
             <SelectTrigger className="w-full md:w-[240px] h-11 hidden md:flex" aria-label="Filter by category">
             <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="min-w-[240px]">
            {dynamicCategories.map(cat => (
              <SelectItem key={cat} value={cat} className="cursor-pointer py-2.5">{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredLinks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-500">
          {filteredLinks.map((link) => (
            <LinkCard key={link.id} link={link} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg animate-in fade-in-0 duration-500">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground"/>
          <h3 className="mt-4 text-xl font-semibold text-foreground font-headline">No Links Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {links.length > 0 ? "Try adjusting your search or filter." : "Get started by adding a new link above!"}
          </p>
        </div>
      )}
    </div>
  );
}