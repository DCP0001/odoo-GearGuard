import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ EQUIPMENT ROUTES ============
  equipment: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllEquipment();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const eq = await db.getEquipmentById(input.id);
        if (!eq) throw new TRPCError({ code: "NOT_FOUND" });
        return eq;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        serialNumber: z.string().min(1),
        categoryId: z.number(),
        maintenanceTeamId: z.number().optional(),
        department: z.string().optional(),
        assignedTo: z.string().optional(),
        location: z.string().optional(),
        purchaseDate: z.date().optional(),
        warrantyExpiry: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.createEquipment(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        categoryId: z.number().optional(),
        maintenanceTeamId: z.number().optional(),
        department: z.string().optional(),
        assignedTo: z.string().optional(),
        location: z.string().optional(),
        status: z.enum(["active", "inactive", "scrapped"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...data } = input;
        return await db.updateEquipment(id, data);
      }),
  }),

  // ============ MAINTENANCE TEAM ROUTES ============
  teams: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllTeams();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const team = await db.getTeamById(input.id);
        if (!team) throw new TRPCError({ code: "NOT_FOUND" });
        return team;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.createTeam(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...data } = input;
        return await db.updateTeam(id, data);
      }),

    getMembers: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTeamMembers(input.teamId);
      }),

    addMember: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        userId: z.number(),
        role: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.addTeamMember(input);
      }),

    removeMember: protectedProcedure
      .input(z.object({ memberId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.removeTeamMember(input.memberId);
      }),
  }),

  // ============ EQUIPMENT CATEGORY ROUTES ============
  categories: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllCategories();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const category = await db.getCategoryById(input.id);
        if (!category) throw new TRPCError({ code: "NOT_FOUND" });
        return category;
      }),
  }),

  // ============ MAINTENANCE REQUEST ROUTES ============
  requests: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllMaintenanceRequests();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const request = await db.getMaintenanceRequestById(input.id);
        if (!request) throw new TRPCError({ code: "NOT_FOUND" });
        return request;
      }),

    getByEquipment: protectedProcedure
      .input(z.object({ equipmentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMaintenanceRequestsByEquipment(input.equipmentId);
      }),

    getByTeam: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMaintenanceRequestsByTeam(input.teamId);
      }),

    getByStatus: protectedProcedure
      .input(z.object({ status: z.string() }))
      .query(async ({ input }) => {
        return await db.getMaintenanceRequestsByStatus(input.status);
      }),

    create: protectedProcedure
      .input(z.object({
        type: z.enum(["corrective", "preventive"]),
        subject: z.string().min(1),
        description: z.string().optional(),
        equipmentId: z.number(),
        maintenanceTeamId: z.number(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        scheduledDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Generate request number
        const requestNumber = `MR-${Date.now()}`;
        
        const result = await db.createMaintenanceRequest({
          requestNumber,
          type: input.type,
          subject: input.subject,
          description: input.description,
          equipmentId: input.equipmentId,
          maintenanceTeamId: input.maintenanceTeamId,
          priority: input.priority || "medium",
          status: "new",
          scheduledDate: input.scheduledDate,
        });

        // Log history - get the created request ID from result
        const requestId = (result as any).insertId || 1;
        if (requestId && requestId > 0) {
          await db.addMaintenanceHistory({
            requestId: requestId,
            equipmentId: input.equipmentId,
            action: "created",
            newValue: JSON.stringify(input),
            changedBy: ctx.user.id,
          }).catch(() => {
            // Silently fail if history logging fails
          });
        }

        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "in_progress", "repaired", "scrap"]).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        assignedToUserId: z.number().optional(),
        startedAt: z.date().optional(),
        completedAt: z.date().optional(),
        durationMinutes: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const oldRequest = await db.getMaintenanceRequestById(id);
        
        if (!oldRequest) throw new TRPCError({ code: "NOT_FOUND" });

        const result = await db.updateMaintenanceRequest(id, data);

        // Log history for status changes
        if (data.status && data.status !== oldRequest.status) {
          await db.addMaintenanceHistory({
            requestId: id,
            equipmentId: oldRequest.equipmentId,
            action: "status_changed",
            oldValue: oldRequest.status,
            newValue: data.status,
            changedBy: ctx.user.id,
          });

          // If equipment is scrapped, mark equipment as scrapped
          if (data.status === "scrap") {
            await db.updateEquipment(oldRequest.equipmentId, { status: "scrapped" });
          }
        }

        return result;
      }),
  }),

  // ============ MAINTENANCE HISTORY ROUTES ============
  history: router({
    getByRequest: protectedProcedure
      .input(z.object({ requestId: z.number() }))
      .query(async ({ input }) => {
        return await db.getHistoryByRequest(input.requestId);
      }),

    getByEquipment: protectedProcedure
      .input(z.object({ equipmentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getHistoryByEquipment(input.equipmentId);
      }),
  }),

  // ============ EQUIPMENT MAINTENANCE LOG ROUTES ============
  maintenanceLog: router({
    getByEquipment: protectedProcedure
      .input(z.object({ equipmentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getEquipmentLog(input.equipmentId);
      }),

    add: protectedProcedure
      .input(z.object({
        equipmentId: z.number(),
        requestId: z.number().optional(),
        serviceType: z.string().min(1),
        description: z.string().optional(),
        technician: z.string().optional(),
        cost: z.string().optional(),
        nextServiceDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { cost, ...rest } = input;
        return await db.addEquipmentLog({
          ...rest,
          cost: cost ? cost.toString() : undefined,
        });
      }),
  }),

  // ============ STATISTICS & DASHBOARD ROUTES ============
  stats: router({
    dashboard: protectedProcedure.query(async () => {
      const openRequests = await db.getOpenRequestsCount();
      const overdueRequests = await db.getOverdueRequestsCount();
      const upcomingMaintenance = await db.getUpcomingPreventiveMaintenance(7);
      const allRequests = await db.getAllMaintenanceRequests();
      const allEquipment = await db.getAllEquipment();
      const allTeams = await db.getAllTeams();

      return {
        openRequests,
        overdueRequests,
        upcomingMaintenanceCount: upcomingMaintenance.length,
        totalRequests: allRequests.length,
        totalEquipment: allEquipment.length,
        activeEquipment: allEquipment.filter(e => e.status === "active").length,
        totalTeams: allTeams.length,
        requestsByStatus: {
          new: allRequests.filter(r => r.status === "new").length,
          inProgress: allRequests.filter(r => r.status === "in_progress").length,
          repaired: allRequests.filter(r => r.status === "repaired").length,
          scrap: allRequests.filter(r => r.status === "scrap").length,
        },
      };
    }),

    upcomingMaintenance: protectedProcedure
      .input(z.object({ days: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getUpcomingPreventiveMaintenance(input.days || 7);
      }),

    requestsByPriority: protectedProcedure
      .input(z.object({ priority: z.string() }))
      .query(async ({ input }) => {
        return await db.getRequestsByPriority(input.priority);
      }),
  }),
});

export type AppRouter = typeof appRouter;
