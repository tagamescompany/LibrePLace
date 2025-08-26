import { pgTable, text, varchar, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const pixels = pgTable("pixels", {
  id: varchar("id").primaryKey(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  color: varchar("color", { length: 7 }).notNull(), // hex color
  placedBy: varchar("placed_by"),
  placedAt: timestamp("placed_at").notNull().defaultNow(),
  brushSize: integer("brush_size").notNull().default(1),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPixelSchema = createInsertSchema(pixels).omit({
  id: true,
  placedAt: true,
}).extend({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  brushSize: z.number().min(1).max(10),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPixel = z.infer<typeof insertPixelSchema>;
export type Pixel = typeof pixels.$inferSelect;
