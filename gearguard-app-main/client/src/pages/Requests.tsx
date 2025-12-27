import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Requests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "corrective",
    subject: "",
    description: "",
    equipmentId: "",
    maintenanceTeamId: "",
    priority: "medium",
    scheduledDate: "",
  });

  const { data: requests, isLoading, refetch } = trpc.requests.list.useQuery();
  const { data: equipment } = trpc.equipment.list.useQuery();
  const { data: teams } = trpc.teams.list.useQuery();

  const createMutation = trpc.requests.create.useMutation({
    onSuccess: () => {
      toast.success("Maintenance request created successfully");
      setIsDialogOpen(false);
      setFormData({
        type: "corrective",
        subject: "",
        description: "",
        equipmentId: "",
        maintenanceTeamId: "",
        priority: "medium",
        scheduledDate: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create request");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.equipmentId || !formData.maintenanceTeamId) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      type: formData.type as "corrective" | "preventive",
      subject: formData.subject,
      description: formData.description || undefined,
      equipmentId: parseInt(formData.equipmentId),
      maintenanceTeamId: parseInt(formData.maintenanceTeamId),
      priority: formData.priority as "low" | "medium" | "high" | "critical",
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
    });
  };

  const filteredRequests = requests?.filter((request) => {
    const matchesSearch =
      request.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      new: "badge-new",
      in_progress: "badge-in-progress",
      repaired: "badge-repaired",
      scrap: "badge-scrap",
    };
    return badges[status] || "badge-new";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "badge-priority-low",
      medium: "badge-priority-medium",
      high: "badge-priority-high",
      critical: "badge-priority-critical",
    };
    return colors[priority] || "badge-priority-medium";
  };

  const getEquipmentName = (equipmentId: number) => {
    return equipment?.find((e) => e.id === equipmentId)?.name || "Unknown";
  };

  const getTeamName = (teamId: number) => {
    return teams?.find((t) => t.id === teamId)?.name || "Unknown";
  };

  const isOverdue = (scheduledDate: Date | null, status: string) => {
    if (!scheduledDate || status === "repaired" || status === "scrap") return false;
    return new Date(scheduledDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 rounded-lg" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Maintenance Requests</h1>
          <p className="text-muted-foreground">Track and manage all maintenance work orders</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Maintenance Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Request Type *</label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrective">Corrective (Breakdown)</SelectItem>
                    <SelectItem value="preventive">Preventive (Routine)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Subject *</label>
                <Input
                  placeholder="e.g., Leaking Oil"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Additional details"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Equipment *</label>
                <Select value={formData.equipmentId} onValueChange={(value) => setFormData({ ...formData, equipmentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment?.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id.toString()}>
                        {eq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Maintenance Team *</label>
                <Select value={formData.maintenanceTeamId} onValueChange={(value) => setFormData({ ...formData, maintenanceTeamId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Scheduled Date</label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Request"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="repaired">Repaired</SelectItem>
            <SelectItem value="scrap">Scrap</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests && filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div key={request.id} className="card-elegant p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{request.subject}</h3>
                        {isOverdue(request.scheduledDate, request.status) && (
                          <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded">
                            OVERDUE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {request.requestNumber} • {getEquipmentName(request.equipmentId)} • {getTeamName(request.maintenanceTeamId)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge-status ${getPriorityColor(request.priority)}`}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                  </span>
                  <span className={`badge-status ${getStatusBadge(request.status)}`}>
                    {request.status === "in_progress" ? "In Progress" : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
              {request.scheduledDate && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Scheduled: {new Date(request.scheduledDate).toLocaleString()}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="card-elegant p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No maintenance requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}
