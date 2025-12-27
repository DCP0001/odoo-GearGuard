import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

const COLUMNS = [
  { id: "new", title: "New", color: "bg-blue-50 dark:bg-blue-950", icon: "📝" },
  { id: "in_progress", title: "In Progress", color: "bg-amber-50 dark:bg-amber-950", icon: "⚙️" },
  { id: "repaired", title: "Repaired", color: "bg-emerald-50 dark:bg-emerald-950", icon: "✅" },
  { id: "scrap", title: "Scrap", color: "bg-slate-50 dark:bg-slate-950", icon: "🗑️" },
];

interface RequestCard {
  id: number;
  requestNumber: string;
  subject: string;
  priority: string;
  status: string;
  equipmentId: number;
  maintenanceTeamId: number;
  assignedToUserId: number | null;
  scheduledDate: Date | null;
}

export default function KanbanBoard() {
  const { data: requests, isLoading, refetch } = trpc.requests.list.useQuery();
  const { data: equipment } = trpc.equipment.list.useQuery();
  const updateMutation = trpc.requests.update.useMutation({
    onSuccess: () => {
      toast.success("Request updated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update request");
    },
  });

  const [draggedCard, setDraggedCard] = useState<RequestCard | null>(null);

  const getRequestsByStatus = (status: string) => {
    return requests?.filter((r) => r.status === status) || [];
  };

  const getEquipmentName = (equipmentId: number) => {
    return equipment?.find((e) => e.id === equipmentId)?.name || "Unknown";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[priority] || colors.medium;
  };

  const isOverdue = (scheduledDate: Date | null) => {
    if (!scheduledDate) return false;
    return new Date(scheduledDate) < new Date();
  };

  const handleDragStart = (card: RequestCard) => {
    setDraggedCard(card);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: string) => {
    if (!draggedCard) return;
    if (draggedCard.status === status) {
      setDraggedCard(null);
      return;
    }

    updateMutation.mutate({
      id: draggedCard.id,
      status: status as any,
    });
    setDraggedCard(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-24 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Kanban Board</h1>
        <p className="text-muted-foreground">Drag and drop requests to update their status</p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((column) => {
          const columnRequests = getRequestsByStatus(column.id);
          return (
            <div
              key={column.id}
              className={`${column.color} rounded-lg p-4 min-h-96`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <span className="text-lg">{column.icon}</span>
                <h2 className="font-semibold text-foreground">{column.title}</h2>
                <span className="ml-auto bg-background/50 px-2 py-1 rounded text-xs font-medium text-muted-foreground">
                  {columnRequests.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {columnRequests.length > 0 ? (
                  columnRequests.map((request) => (
                    <div
                      key={request.id}
                      draggable
                      onDragStart={() => handleDragStart(request)}
                      className={`bg-card rounded-lg p-3 cursor-move hover:shadow-md transition-shadow border border-border ${
                        draggedCard?.id === request.id ? "opacity-50" : ""
                      }`}
                    >
                      {/* Request Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-xs font-mono text-muted-foreground">
                            {request.requestNumber}
                          </p>
                          <p className="text-sm font-semibold text-foreground line-clamp-2">
                            {request.subject}
                          </p>
                        </div>
                        {isOverdue(request.scheduledDate) && (
                          <div className="indicator-overdue ml-2" title="Overdue" />
                        )}
                      </div>

                      {/* Equipment Info */}
                      <p className="text-xs text-muted-foreground mb-2 truncate">
                        {getEquipmentName(request.equipmentId)}
                      </p>

                      {/* Priority Badge */}
                      <div className="flex items-center justify-between">
                        <span className={`badge-status text-xs ${getPriorityColor(request.priority)}`}>
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        </span>
                        {request.scheduledDate && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(request.scheduledDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No requests</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="card-elegant p-4">
        <h3 className="font-semibold mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span>Low Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span>Critical Priority</span>
          </div>
        </div>
      </div>
    </div>
  );
}
