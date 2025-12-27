import React from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Clock, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.stats.dashboard.useQuery();
  const { data: upcomingMaintenance } = trpc.stats.upcomingMaintenance.useQuery({ days: 7 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
    href,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    color: string;
    href?: string;
  }) => {
    const content = (
      <div className={`card-elegant p-6 cursor-pointer hover:elevation-2`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your maintenance operations.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={AlertCircle}
          label="Open Requests"
          value={stats?.openRequests || 0}
          color="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
          href="/requests"
        />
        <StatCard
          icon={Clock}
          label="Overdue Tasks"
          value={stats?.overdueRequests || 0}
          color="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300"
          href="/requests"
        />
        <StatCard
          icon={Zap}
          label="Upcoming (7 days)"
          value={stats?.upcomingMaintenanceCount || 0}
          color="bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300"
          href="/calendar"
        />
        <StatCard
          icon={CheckCircle}
          label="Active Equipment"
          value={stats?.activeEquipment || 0}
          color="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300"
          href="/equipment"
        />
      </div>

      {/* Request Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-elegant p-6">
          <h3 className="font-semibold text-lg mb-4">Request Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">New</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${
                        stats?.totalRequests
                          ? (stats.requestsByStatus.new / stats.totalRequests) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold w-8 text-right">
                  {stats?.requestsByStatus.new || 0}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">In Progress</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{
                      width: `${
                        stats?.totalRequests
                          ? (stats.requestsByStatus.inProgress / stats.totalRequests) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold w-8 text-right">
                  {stats?.requestsByStatus.inProgress || 0}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Repaired</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{
                      width: `${
                        stats?.totalRequests
                          ? (stats.requestsByStatus.repaired / stats.totalRequests) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold w-8 text-right">
                  {stats?.requestsByStatus.repaired || 0}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Scrapped</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-500"
                    style={{
                      width: `${
                        stats?.totalRequests
                          ? (stats.requestsByStatus.scrap / stats.totalRequests) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold w-8 text-right">
                  {stats?.requestsByStatus.scrap || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="card-elegant p-6">
          <h3 className="font-semibold text-lg mb-4">System Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Equipment</span>
              <span className="font-semibold text-lg">{stats?.totalEquipment || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Teams</span>
              <span className="font-semibold text-lg">{stats?.totalTeams || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Requests</span>
              <span className="font-semibold text-lg">{stats?.totalRequests || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <span className="font-semibold text-lg">
                {stats?.totalRequests
                  ? Math.round((stats.requestsByStatus.repaired / stats.totalRequests) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-elegant p-6">
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/requests">
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                Create Request
              </button>
            </Link>
            <Link href="/equipment">
              <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium">
                Add Equipment
              </button>
            </Link>
            <Link href="/kanban">
              <button className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium">
                View Kanban Board
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Maintenance */}
      {upcomingMaintenance && upcomingMaintenance.length > 0 && (
        <div className="card-elegant p-6">
          <h3 className="font-semibold text-lg mb-4">Upcoming Maintenance (Next 7 Days)</h3>
          <div className="space-y-2">
            {upcomingMaintenance.slice(0, 5).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">{request.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.scheduledDate?.toLocaleDateString()}
                  </p>
                </div>
                <span className="badge-status badge-in-progress">Scheduled</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
