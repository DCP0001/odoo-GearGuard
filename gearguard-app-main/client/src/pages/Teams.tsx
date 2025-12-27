import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Teams() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { data: teams, isLoading, refetch } = trpc.teams.list.useQuery();
  const { data: teamMembers } = trpc.teams.getMembers.useQuery(
    { teamId: teams?.[0]?.id || 0 },
    { enabled: teams && teams.length > 0 }
  );

  const createMutation = trpc.teams.create.useMutation({
    onSuccess: () => {
      toast.success("Team created successfully");
      setIsDialogOpen(false);
      setFormData({ name: "", description: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create team");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Please enter a team name");
      return;
    }

    createMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Maintenance Teams</h1>
          <p className="text-muted-foreground">Organize technicians into specialized teams</p>
        </div>
        {user?.role === "admin" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Team Name *</label>
                  <Input
                    placeholder="e.g., Mechanics, Electricians, IT Support"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Team description and responsibilities"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Team"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams && teams.length > 0 ? (
          teams.map((team) => (
            <div key={team.id} className="card-elegant p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{team.name}</h3>
              {team.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{team.description}</p>
              )}
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(team.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card-elegant p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No teams created yet</p>
          </div>
        )}
      </div>

      {/* Team Details Section */}
      {teams && teams.length > 0 && (
        <div className="card-elegant p-6">
          <h2 className="text-2xl font-bold mb-4">Team Overview</h2>
          <div className="space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">{team.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {team.description || "No description provided"}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    Team ID: {team.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
