import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Maintenance Teams - Groups of technicians organized by specialty
 */
export const maintenanceTeams = mysqlTable("maintenance_teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Mechanics", "Electricians", "IT Support"
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MaintenanceTeam = typeof maintenanceTeams.$inferSelect;
export type InsertMaintenanceTeam = typeof maintenanceTeams.$inferInsert;

/**
 * Team Members - Users assigned to maintenance teams
 */
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  teamId: int("teamId").notNull(),
  role: varchar("role", { length: 100 }), // e.g., "Lead", "Technician", "Apprentice"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

/**
 * Equipment Categories - Classification of assets
 */
export const equipmentCategories = mysqlTable("equipment_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "CNC Machine", "Printer", "Laptop"
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EquipmentCategory = typeof equipmentCategories.$inferSelect;
export type InsertEquipmentCategory = typeof equipmentCategories.$inferInsert;

/**
 * Equipment/Assets - Physical machines and devices tracked for maintenance
 */
export const equipment = mysqlTable("equipment", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Printer 01", "CNC Machine A"
  serialNumber: varchar("serialNumber", { length: 255 }).notNull().unique(),
  categoryId: int("categoryId").notNull(), // Foreign key to equipmentCategories
  maintenanceTeamId: int("maintenanceTeamId"), // Default team assigned to this equipment
  department: varchar("department", { length: 255 }), // e.g., "Production", "IT", "Maintenance"
  assignedTo: varchar("assignedTo", { length: 255 }), // e.g., employee name or ID
  location: varchar("location", { length: 255 }), // Physical location of equipment
  purchaseDate: timestamp("purchaseDate"),
  warrantyExpiry: timestamp("warrantyExpiry"),
  status: mysqlEnum("status", ["active", "inactive", "scrapped"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = typeof equipment.$inferInsert;

/**
 * Maintenance Requests - Work orders for repairs and maintenance
 */
export const maintenanceRequests = mysqlTable("maintenance_requests", {
  id: int("id").autoincrement().primaryKey(),
  requestNumber: varchar("requestNumber", { length: 50 }).notNull().unique(), // e.g., "MR-2024-001"
  type: mysqlEnum("type", ["corrective", "preventive"]).notNull(), // Breakdown vs Routine Checkup
  subject: varchar("subject", { length: 255 }).notNull(), // e.g., "Leaking Oil"
  description: text("description"),
  equipmentId: int("equipmentId").notNull(), // Foreign key to equipment
  maintenanceTeamId: int("maintenanceTeamId").notNull(), // Assigned team
  assignedToUserId: int("assignedToUserId"), // Specific technician assigned
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  status: mysqlEnum("status", ["new", "in_progress", "repaired", "scrap"]).default("new").notNull(),
  scheduledDate: timestamp("scheduledDate"), // When maintenance should happen (for preventive)
  startedAt: timestamp("startedAt"), // When work began
  completedAt: timestamp("completedAt"), // When work finished
  durationMinutes: int("durationMinutes"), // How long the repair took
  notes: text("notes"), // Technician notes and findings
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = typeof maintenanceRequests.$inferInsert;

/**
 * Maintenance History - Audit log of all changes to maintenance requests
 */
export const maintenanceHistory = mysqlTable("maintenance_history", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(), // Foreign key to maintenanceRequests
  equipmentId: int("equipmentId").notNull(), // Denormalized for quick access
  action: varchar("action", { length: 100 }).notNull(), // e.g., "created", "status_changed", "assigned"
  oldValue: text("oldValue"), // Previous value (JSON serialized if needed)
  newValue: text("newValue"), // New value (JSON serialized if needed)
  changedBy: int("changedBy"), // User who made the change
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MaintenanceHistory = typeof maintenanceHistory.$inferSelect;
export type InsertMaintenanceHistory = typeof maintenanceHistory.$inferInsert;

/**
 * Equipment Maintenance History - Service records for each asset
 */
export const equipmentMaintenanceLog = mysqlTable("equipment_maintenance_log", {
  id: int("id").autoincrement().primaryKey(),
  equipmentId: int("equipmentId").notNull(), // Foreign key to equipment
  requestId: int("requestId"), // Link to maintenance request if applicable
  serviceType: varchar("serviceType", { length: 100 }).notNull(), // e.g., "Oil Change", "Inspection", "Repair"
  description: text("description"),
  technician: varchar("technician", { length: 255 }), // Name of technician who performed service
  cost: varchar("cost", { length: 50 }), // Cost of service if applicable
  nextServiceDate: timestamp("nextServiceDate"), // Recommended next service date
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EquipmentMaintenanceLog = typeof equipmentMaintenanceLog.$inferSelect;
export type InsertEquipmentMaintenanceLog = typeof equipmentMaintenanceLog.$inferInsert;
