import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  tasks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserTasks(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        categoryId: z.number().optional(),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTask({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          priority: input.priority,
          dueDate: input.dueDate,
          completed: 0,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        categoryId: z.number().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        completed: z.number().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const task = await db.getTaskById(input.id);
        if (!task || task.userId !== ctx.user.id) {
          throw new Error("Task not found or unauthorized");
        }
        const { id, ...updateData } = input;
        return db.updateTask(id, updateData);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const task = await db.getTaskById(input.id);
        if (!task || task.userId !== ctx.user.id) {
          throw new Error("Task not found or unauthorized");
        }
        return db.deleteTask(input.id);
      }),
    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getTaskStats(ctx.user.id);
    }),
  }),

  categories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserCategories(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createCategory({
          userId: ctx.user.id,
          name: input.name,
          color: input.color || "#2B77E8",
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updateData } = input;
        return db.updateCategory(id, updateData);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteCategory(input.id);
      }),
  }),

  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserSettings(ctx.user.id);
    }),
    update: protectedProcedure
      .input(z.object({
        slackWebhookUrl: z.string().optional(),
        googleCalendarAccessToken: z.string().optional(),
        googleCalendarRefreshToken: z.string().optional(),
        slackReportEnabled: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.upsertUserSettings(ctx.user.id, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
