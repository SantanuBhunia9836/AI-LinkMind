"use client";

import { useState, useEffect } from 'react';
import type { SavedLink } from "@/lib/types";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3F51B5', '#009688', '#FF9800', '#E91E63', '#4CAF50', '#2196F3', '#FF5722', '#00BCD4'];

export default function StatsPage() {
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

  const categoryStats = links.reduce((acc, link) => {
    const existing = acc.find(item => item.name === link.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: link.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const creatorStats = links.reduce((acc, link) => {
    const existing = acc.find(item => item.name === link.creatorName);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: link.creatorName, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const topCategories = categoryStats.sort((a, b) => b.value - a.value);

  const linksPerDay = links.reduce((acc, link) => {
    const date = new Date(link.createdAt).toLocaleDateString();
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ date, count: 1 });
    }
    return acc;
  }, [] as { date: string; count: number }[]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold font-heading tracking-tight">Statistics</h1>
          <p className="text-muted-foreground mt-2">View insights about your video link collection</p>
        </div>

        {isClient && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{links.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categoryStats.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unique Creators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{creatorStats.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{topCategories[0]?.name || "N/A"}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {isClient && links.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Links by Category</CardTitle>
                  <CardDescription>Distribution of your saved links</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Creators</CardTitle>
                  <CardDescription>Your most saved creators</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={creatorStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3F51B5" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {linksPerDay.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Links Added Over Time</CardTitle>
                  <CardDescription>Daily breakdown of saved links</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={linksPerDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#009688" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {isClient && links.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No statistics available yet. Start adding links to see insights!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
