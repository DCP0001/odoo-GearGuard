import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Toaster } from "sonner";

interface GearGuardLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { label: "Dashboard", href: "/", icon: "📊" },
  { label: "Equipment", href: "/equipment", icon: "⚙️" },
  { label: "Maintenance Requests", href: "/requests", icon: "🔧" },
  { label: "Kanban Board", href: "/kanban", icon: "📋" },
  { label: "Calendar", href: "/calendar", icon: "📅" },
  { label: "Teams", href: "/teams", icon: "👥" },
  { label: "Reports", href: "/reports", icon: "📈" },
];

const adminItems = [
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

export default function GearGuardLayout({ children }: GearGuardLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (href: string) => {
    return location === href || (href !== "/" && location.startsWith(href));
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-card border-r border-border transition-all duration-300 flex flex-col shadow-sm`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!sidebarOpen && "justify-center w-full"}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-lg">
                GG
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="font-bold text-lg text-primary">GearGuard</h1>
                  <p className="text-xs text-muted-foreground">Maintenance Pro</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </a>
          ))}

          {user?.role === "admin" && (
            <>
              <div className="my-4 border-t border-border" />
              {adminItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </a>
              ))}
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border space-y-2">
          <div className={`flex items-center gap-3 ${!sidebarOpen && "justify-center"}`}>
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {sidebarOpen && "Logout"}
          </Button>
        </div>

        {/* Toggle Button */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border shadow-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">GearGuard Maintenance System</h2>
            <p className="text-sm text-muted-foreground">Professional asset and maintenance tracking</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Role: <span className="font-semibold text-primary capitalize">{user?.role}</span>
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
