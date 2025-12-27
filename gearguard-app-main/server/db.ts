import { eq, and, desc, asc, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  equipment,
  maintenanceTeams,
  teamMembers,
  equipmentCategories,
  maintenanceRequests,
  maintenanceHistory,
  equipmentMaintenanceLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ EQUIPMENT QUERIES ============

export async function getAllEquipment() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(equipment).orderBy(asc(equipment.name));
}

export async function getEquipmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(equipment).where(eq(equipment.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createEquipment(data: typeof equipment.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(equipment).values(data);
  return result;
}

export async function updateEquipment(id: number, data: Partial<typeof equipment.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(equipment).set(data).where(eq(equipment.id, id));
}

// ============ MAINTENANCE TEAM QUERIES ============

export async function getAllTeams() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(maintenanceTeams).orderBy(asc(maintenanceTeams.name));
}

export async function getTeamById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(maintenanceTeams).where(eq(maintenanceTeams.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createTeam(data: typeof maintenanceTeams.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(maintenanceTeams).values(data);
  return result;
}

export async function updateTeam(id: number, data: Partial<typeof maintenanceTeams.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(maintenanceTeams).set(data).where(eq(maintenanceTeams.id, id));
}

// ============ TEAM MEMBER QUERIES ============

export async function getTeamMembers(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
}

export async function addTeamMember(data: typeof teamMembers.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(teamMembers).values(data);
}

export async function removeTeamMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(teamMembers).where(eq(teamMembers.id, id));
}

// ============ EQUIPMENT CATEGORY QUERIES ============

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(equipmentCategories).orderBy(asc(equipmentCategories.name));
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(equipmentCategories).where(eq(equipmentCategories.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============ MAINTENANCE REQUEST QUERIES ============

export async function getAllMaintenanceRequests() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(maintenanceRequests).orderBy(desc(maintenanceRequests.createdAt));
}

export async function getMaintenanceRequestById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getMaintenanceRequestsByEquipment(equipmentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(maintenanceRequests)
    .where(eq(maintenanceRequests.equipmentId, equipmentId))
    .orderBy(desc(maintenanceRequests.createdAt));
}

export async function getMaintenanceRequestsByTeam(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(maintenanceRequests)
    .where(eq(maintenanceRequests.maintenanceTeamId, teamId))
    .orderBy(desc(maintenanceRequests.createdAt));
}

export async function getMaintenanceRequestsByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(maintenanceRequests)
    .where(eq(maintenanceRequests.status, status as any))
    .orderBy(desc(maintenanceRequests.createdAt));
}

export async function createMaintenanceRequest(data: typeof maintenanceRequests.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(maintenanceRequests).values(data);
  return result;
}

export async function updateMaintenanceRequest(id: number, data: Partial<typeof maintenanceRequests.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(maintenanceRequests).set(data).where(eq(maintenanceRequests.id, id));
}

// ============ MAINTENANCE HISTORY QUERIES ============

export async function getHistoryByRequest(requestId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(maintenanceHistory)
    .where(eq(maintenanceHistory.requestId, requestId))
    .orderBy(desc(maintenanceHistory.createdAt));
}

export async function getHistoryByEquipment(equipmentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(maintenanceHistory)
    .where(eq(maintenanceHistory.equipmentId, equipmentId))
    .orderBy(desc(maintenanceHistory.createdAt));
}

export async function addMaintenanceHistory(data: typeof maintenanceHistory.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(maintenanceHistory).values(data);
}

// ============ EQUIPMENT MAINTENANCE LOG QUERIES ============

export async function getEquipmentLog(equipmentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(equipmentMaintenanceLog)
    .where(eq(equipmentMaintenanceLog.equipmentId, equipmentId))
    .orderBy(desc(equipmentMaintenanceLog.createdAt));
}

export async function addEquipmentLog(data: typeof equipmentMaintenanceLog.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(equipmentMaintenanceLog).values(data);
}

// ============ STATISTICS & REPORTING QUERIES ============

export async function getOpenRequestsCount() {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select().from(maintenanceRequests)
    .where(inArray(maintenanceRequests.status, ['new', 'in_progress']));
  return result.length;
}

export async function getOverdueRequestsCount() {
  const db = await getDb();
  if (!db) return 0;
  
  const now = new Date();
  const result = await db.select().from(maintenanceRequests)
    .where(and(
      inArray(maintenanceRequests.status, ['new', 'in_progress'])
    ));
  return result.filter(r => r.scheduledDate && r.scheduledDate < now).length;
}

export async function getUpcomingPreventiveMaintenance(days: number = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  const result = await db.select().from(maintenanceRequests)
    .where(eq(maintenanceRequests.type, 'preventive'))
    .orderBy(asc(maintenanceRequests.scheduledDate));
  
  return result.filter(r => 
    r.scheduledDate && r.scheduledDate >= now && r.scheduledDate <= futureDate
  );
}

export async function getRequestsByPriority(priority: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(maintenanceRequests)
    .where(eq(maintenanceRequests.priority, priority as any))
    .orderBy(desc(maintenanceRequests.createdAt));
}
