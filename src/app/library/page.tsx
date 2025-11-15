"use client";

import { useState, useEffect, useMemo } from 'react';
import type { SavedLink } from "@/lib/types";
import { AppLayout } from "@/components/app-layout";
import { LinkLibrary } from "@/components/link-library";
import { LibrarySkeleton } from "@/components/library-skeleton";

export default function LibraryPage() {
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

  const handleDelete = (id: string) => {
    setLinks(prevLinks => prevLinks.filter(link => link.id !== id));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold font-heading tracking-tight">My Library</h1>
          <p className="text-muted-foreground mt-2">Manage all your saved video links</p>
        </div>

        {isClient ? (
          <LinkLibrary links={links} onDelete={handleDelete} />
        ) : (
          <LibrarySkeleton />
        )}
      </div>
    </AppLayout>
  );
}
