import { eq } from "drizzle-orm";
import { tasks, categories, userSettings, InsertTask, InsertCategory, InsertUserSettings } from "../drizzle/schema";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
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

// Task Management Queries
export async function getUserTasks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.userId, userId));
}

export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values(data);
  return result;
}

export async function updateTask(taskId: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(tasks).set(data).where(eq(tasks.id, taskId));
}

export async function deleteTask(taskId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(tasks).where(eq(tasks.id, taskId));
}

export async function getTaskById(taskId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Category Management Queries
export async function getUserCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.userId, userId));
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(categories).values(data);
}

export async function updateCategory(categoryId: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(categories).set(data).where(eq(categories.id, categoryId));
}

export async function deleteCategory(categoryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(categories).where(eq(categories.id, categoryId));
}

// User Settings Queries
export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertUserSettings(userId: number, data: Partial<InsertUserSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserSettings(userId);
  if (existing) {
    return db.update(userSettings).set(data).where(eq(userSettings.userId, userId));
  } else {
    return db.insert(userSettings).values({ userId, ...data });
  }
}

// Task Statistics
export async function getTaskStats(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, completed: 0, completionRate: 0 };
  
  const userTasks = await getUserTasks(userId);
  const total = userTasks.length;
  const completed = userTasks.filter(t => t.completed === 1).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { total, completed, completionRate };
}
