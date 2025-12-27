import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Wrench, AlertCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Equipment() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    categoryId: "",
    maintenanceTeamId: "",
    department: "",
    location: "",
  });

  const { data: equipment, isLoading, refetch } = trpc.equipment.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: teams } = trpc.teams.list.useQuery();
  const createMutation = trpc.equipment.create.useMutation({
    onSuccess: () => {
      toast.success("Equipment created successfully");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        serialNumber: "",
        categoryId: "",
        maintenanceTeamId: "",
        department: "",
        location: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create equipment");
    },
  });

  const { data: requests } = trpc.requests.list.useQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.serialNumber || !formData.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      name: formData.name,
      serialNumber: formData.serialNumber,
      categoryId: parseInt(formData.categoryId),
      maintenanceTeamId: formData.maintenanceTeamId ? parseInt(formData.maintenanceTeamId) : undefined,
      department: formData.department || undefined,
      location: formData.location || undefined,
    });
  };

  const filteredEquipment = equipment?.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: "badge-status bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      inactive: "badge-status bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
      scrapped: "badge-status bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return badges[status] || badges.inactive;
  };

  const getCategoryName = (categoryId: number) => {
    return categories?.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  const getTeamName = (teamId: number | null) => {
    if (!teamId) return "Unassigned";
    return teams?.find((t) => t.id === teamId)?.name || "Unknown";
  };

  const getOpenRequestsCount = (equipmentId: number) => {
    return requests?.filter(
      (r) => r.equipmentId === equipmentId && ["new", "in_progress"].includes(r.status)
    ).length || 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 rounded-lg" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Equipment Registry</h1>
          <p className="text-muted-foreground">Manage all company assets and equipment</p>
        </div>
        {user?.role === "admin" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Equipment Name *</label>
                  <Input
                    placeholder="e.g., CNC Machine A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Serial Number *</label>
                  <Input
                    placeholder="e.g., SN-2024-001"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Maintenance Team</label>
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
                  <label className="text-sm font-medium">Department</label>
                  <Input
                    placeholder="e.g., Production"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    placeholder="e.g., Building A, Floor 2"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Equipment"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or serial number..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="scrapped">Scrapped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Equipment List */}
      <div className="space-y-3">
        {filteredEquipment && filteredEquipment.length > 0 ? (
          filteredEquipment.map((item) => {
            const openRequests = getOpenRequestsCount(item.id);
            return (
              <div key={item.id} className="card-elegant p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">SN: {item.serialNumber}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Category</p>
                        <p className="font-medium">{getCategoryName(item.categoryId)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Team</p>
                        <p className="font-medium">{getTeamName(item.maintenanceTeamId)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Location</p>
                        <p className="font-medium">{item.location || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Department</p>
                        <p className="font-medium">{item.department || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={getStatusBadge(item.status)}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    {openRequests > 0 && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs">{openRequests} Open</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card-elegant p-12 text-center">
            <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No equipment found</p>
          </div>
        )}
      </div>
    </div>
  );
}
