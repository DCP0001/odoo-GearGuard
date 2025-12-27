import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading GearGuard...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">GG</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">GearGuard</h1>
          <p className="text-lg text-muted-foreground">The Ultimate Maintenance Tracker</p>
        </div>

        {/* Description */}
        <div className="mb-8 space-y-4">
          <p className="text-foreground text-base leading-relaxed">
            Professional maintenance management system for tracking assets, managing teams, and optimizing maintenance workflows.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="font-semibold text-primary mb-1">⚙️</p>
              <p className="text-muted-foreground">Equipment Registry</p>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="font-semibold text-primary mb-1">📋</p>
              <p className="text-muted-foreground">Request Tracking</p>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="font-semibold text-primary mb-1">👥</p>
              <p className="text-muted-foreground">Team Management</p>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="font-semibold text-primary mb-1">📊</p>
              <p className="text-muted-foreground">Analytics</p>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <a href={getLoginUrl()}>
          <Button size="lg" className="w-full mb-4">
            Sign In with Manus
          </Button>
        </a>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          Secure authentication powered by Manus OAuth
        </p>
      </div>
    </div>
  );
}
