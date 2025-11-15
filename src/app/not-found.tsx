import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-4 max-w-md">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
        <h1 className="text-4xl font-bold font-heading">404</h1>
        <p className="text-lg text-muted-foreground">Page not found</p>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}
