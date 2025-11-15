"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExportData = () => {
    try {
      const savedLinks = localStorage.getItem("saved-links");
      if (!savedLinks) {
        toast({
          variant: "destructive",
          title: "No data to export",
          description: "You haven't saved any links yet.",
        });
        return;
      }

      const dataStr = JSON.stringify(JSON.parse(savedLinks), null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `link-saver-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        description: "Your links have been exported successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not export your data.",
      });
    }
  };

  const handleClearAllData = () => {
    if (window.confirm("Are you sure? This will delete all your saved links permanently.")) {
      try {
        localStorage.removeItem("saved-links");
        window.location.reload();
        toast({
          description: "All data has been cleared.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Clear failed",
          description: "Could not clear your data.",
        });
      }
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-4xl font-bold font-heading tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your preferences and data</p>
        </div>

        {isClient && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Control your saved links and personal data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Export Your Data</p>
                    <p className="text-sm text-muted-foreground">Download all your saved links as a JSON file</p>
                  </div>
                  <Button onClick={handleExportData} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>These actions cannot be undone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Clearing all data will permanently delete all your saved links. This action cannot be reversed.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleClearAllData} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">LinkSaver</p>
                  <p className="text-sm text-muted-foreground">v1.0.0</p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    An AI-powered link saver that automatically organizes and categorizes your video links.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
