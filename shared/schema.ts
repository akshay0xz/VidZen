import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  mobile: text("mobile").notNull().unique(),
  password: text("password").notNull(),
  profilePicture: text("profile_picture"), // New field for profile pictures
  bio: text("bio"), // New field for user bio
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// OTP table for tracking verification codes
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  mobile: text("mobile").notNull(),
  code: text("code").notNull(),
  verified: boolean("verified").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Videos table for storing uploaded videos
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  filePath: text("file_path").notNull(),
  thumbnailPath: text("thumbnail_path"),
  userId: integer("user_id").notNull().references(() => users.id),
  views: integer("views").default(0).notNull(),
  isHidden: boolean("is_hidden").default(false), // New field to hide videos
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New table for video comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  videoId: integer("video_id").notNull().references(() => videos.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New table for video likes
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videos.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  otpCodes: many(otpCodes),
  videos: many(videos),
  comments: many(comments),
  likes: many(likes),
}));

export const otpCodesRelations = relations(otpCodes, ({ }) => ({}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [comments.videoId],
    references: [videos.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [likes.videoId],
    references: [videos.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  displayName: (schema) => schema.min(2, "Display name must be at least 2 characters"),
  mobile: (schema) => schema.regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  profilePicture: (schema) => schema.optional(),
  bio: (schema) => schema.optional(),
});

export const insertOtpSchema = createInsertSchema(otpCodes, {
  code: (schema) => schema.length(6, "OTP must be 6 digits"),
  mobile: (schema) => schema.regex(/^\d{10}$/, "Mobile number must be 10 digits"),
});

export const insertVideoSchema = createInsertSchema(videos, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  description: (schema) => schema.optional(),
  filePath: (schema) => schema.min(1, "File path is required"),
  thumbnailPath: (schema) => schema.optional(),
  userId: (schema) => schema.positive("User ID must be a positive number"),
  isHidden: (schema) => schema.optional(),
});

export const insertCommentSchema = createInsertSchema(comments, {
  content: (schema) => schema.min(1, "Comment cannot be empty"),
  videoId: (schema) => schema.positive("Video ID must be a positive number"),
  userId: (schema) => schema.positive("User ID must be a positive number"),
});

export const insertLikeSchema = createInsertSchema(likes, {
  videoId: (schema) => schema.positive("Video ID must be a positive number"),
  userId: (schema) => schema.positive("User ID must be a positive number"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
