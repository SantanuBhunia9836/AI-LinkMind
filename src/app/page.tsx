"use client";

import { useState, useEffect, useMemo } from 'react';
import type { SavedLink } from "@/lib/types";

import { AppLayout } from "@/components/app-layout";
import { LinkForm } from "@/components/link-form";
import { LinkLibrary } from "@/components/link-library";
import { LibrarySkeleton } from "@/components/library-skeleton";
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedLinks = localStorage.getItem("saved-links");
      if (savedLinks) {
        setLinks(JSON.parse(savedLinks));
      }
    } catch (error) {
      console.error("Failed to parse links from localStorage", error);
      setLinks([]);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("saved-links", JSON.stringify(links));
    }
  }, [links, isClient]);

  const existingCategories = useMemo(() => {
    const categories = new Set(links.map(link => link.category));
    return Array.from(categories).sort();
  }, [links]);

  const handleLinkAdded = (newLink: SavedLink) => {
    setLinks(prevLinks => [newLink, ...prevLinks]);
  };

  const handleDelete = (id: string) => {
    setLinks(prevLinks => prevLinks.filter(link => link.id !== id));
  };

  return (
    <AppLayout>
      <div className="flex flex-col space-y-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-heading tracking-tight">Welcome Back!</h1>
          <p className="text-muted-foreground text-lg">Start organizing your video links with AI-powered categorization.</p>
        </div>

        <LinkForm onLinkAdded={handleLinkAdded} existingCategories={existingCategories} links={links} />
        
        <Separator className="my-8" />
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold font-heading tracking-tight">Your Link Library</h2>
          <p className="text-muted-foreground max-w-2xl">
            Browse, search, and manage your saved links. Your collection is stored locally in your browser.
          </p>
        </div>
        
        {isClient ? <LinkLibrary links={links} onDelete={handleDelete} /> : <LibrarySkeleton />}
      </div>
    </AppLayout>
  );
}
