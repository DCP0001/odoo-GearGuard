import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: requests, isLoading } = trpc.requests.list.useQuery();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getRequestsForDate = (date: Date) => {
    return requests?.filter((r) => {
      if (!r.scheduledDate) return false;
      const scheduled = new Date(r.scheduledDate);
      return (
        scheduled.getDate() === date.getDate() &&
        scheduled.getMonth() === date.getMonth() &&
        scheduled.getFullYear() === date.getFullYear()
      );
    }) || [];
  };

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = new Date();
  const isToday = (date: Date | null) => {
    if (!date) return false;
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date | null) => {
    if (!date) return false;
    return date.getMonth() === currentDate.getMonth();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Maintenance Calendar</h1>
        <p className="text-muted-foreground">View and schedule preventive maintenance tasks</p>
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 card-elegant p-6">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{monthName}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, idx) => {
              const dayRequests = date ? getRequestsForDate(date) : [];
              const hasRequests = dayRequests.length > 0;

              return (
                <div
                  key={idx}
                  className={`min-h-24 p-2 rounded-lg border ${
                    date === null
                      ? "bg-muted/30"
                      : isToday(date)
                      ? "bg-primary/10 border-primary"
                      : isCurrentMonth(date)
                      ? "bg-card border-border hover:bg-muted/50"
                      : "bg-muted/30 border-border"
                  } transition-colors`}
                >
                  {date && (
                    <>
                      <p
                        className={`text-sm font-semibold mb-1 ${
                          isToday(date) ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {date.getDate()}
                      </p>
                      {hasRequests && (
                        <div className="space-y-1">
                          {dayRequests.slice(0, 2).map((req) => (
                            <div
                              key={req.id}
                              className="text-xs bg-primary/20 text-primary px-1 py-0.5 rounded truncate"
                              title={req.subject}
                            >
                              {req.subject.substring(0, 12)}...
                            </div>
                          ))}
                          {dayRequests.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{dayRequests.length - 2} more
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card-elegant p-6">
          <h3 className="font-semibold text-lg mb-4">Upcoming Maintenance</h3>
          <div className="space-y-3">
            {requests
              ?.filter((r) => {
                if (!r.scheduledDate) return false;
                const scheduled = new Date(r.scheduledDate);
                return scheduled >= today && r.status !== "repaired" && r.status !== "scrap";
              })
              .sort((a, b) => {
                const dateA = new Date(a.scheduledDate || 0);
                const dateB = new Date(b.scheduledDate || 0);
                return dateA.getTime() - dateB.getTime();
              })
              .slice(0, 10)
              .map((request) => (
                <div key={request.id} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {request.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {request.scheduledDate
                      ? new Date(request.scheduledDate).toLocaleDateString()
                      : "No date"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`badge-status text-xs ${
                        request.priority === "critical"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : request.priority === "high"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                          : request.priority === "medium"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                      }`}
                    >
                      {request.priority}
                    </span>
                    <span
                      className={`badge-status text-xs ${
                        request.status === "new"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                      }`}
                    >
                      {request.status === "in_progress" ? "In Progress" : "New"}
                    </span>
                  </div>
                </div>
              ))}
            {!requests || requests.filter((r) => r.scheduledDate && new Date(r.scheduledDate) >= today).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming maintenance</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
