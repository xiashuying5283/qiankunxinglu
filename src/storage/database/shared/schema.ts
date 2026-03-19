import { pgTable, index, unique, serial, integer, varchar, text, jsonb, timestamp, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 用户表（支持正式用户和游客）
export const users = pgTable("users", {
	id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
	email: varchar({ length: 255 }).unique(),
	password: text(),
	name: varchar({ length: 50 }),
	isGuest: boolean("is_guest").default(false).notNull(),
	sessionId: varchar("session_id", { length: 100 }).unique(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_session_idx").using("btree", table.sessionId.asc().nullsLast().op("text_ops")),
]);

export const hexagrams = pgTable("hexagrams", {
	id: serial().notNull(),
	number: integer().notNull(),
	name: varchar({ length: 20 }).notNull(),
	symbol: varchar({ length: 10 }).notNull(),
	upperTrigram: varchar("upper_trigram", { length: 10 }).notNull(),
	lowerTrigram: varchar("lower_trigram", { length: 10 }).notNull(),
	binary: varchar({ length: 10 }).notNull(),
	judgement: text().notNull(),
	judgementMeaning: text("judgement_meaning").notNull(),
	image: text().notNull(),
	imageMeaning: text("image_meaning").notNull(),
	lines: jsonb().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("hexagrams_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("hexagrams_number_idx").using("btree", table.number.asc().nullsLast().op("int4_ops")),
	unique("hexagrams_number_unique").on(table.number),
]);

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const trigrams = pgTable("trigrams", {
	id: serial().notNull(),
	number: integer().notNull(),
	name: varchar({ length: 10 }).notNull(),
	symbol: varchar({ length: 10 }).notNull(),
	nature: varchar({ length: 10 }).notNull(),
	attribute: varchar({ length: 20 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("trigrams_number_idx").using("btree", table.number.asc().nullsLast().op("int4_ops")),
	unique("trigrams_number_unique").on(table.number),
]);

export const fortuneSticks = pgTable("fortune_sticks", {
	id: serial().notNull(),
	number: integer().notNull(),
	title: varchar({ length: 50 }).notNull(),
	poem: text().notNull(),
	meaning: text().notNull(),
	level: varchar({ length: 20 }).notNull(),
	story: text(),
	interpretation: jsonb().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("fortune_sticks_level_idx").using("btree", table.level.asc().nullsLast().op("text_ops")),
	index("fortune_sticks_number_idx").using("btree", table.number.asc().nullsLast().op("int4_ops")),
	unique("fortune_sticks_number_unique").on(table.number),
]);

export const dreamKeywords = pgTable("dream_keywords", {
	id: serial().notNull(),
	keyword: varchar({ length: 50 }).notNull(),
	category: varchar({ length: 20 }).notNull(),
	meaning: text().notNull(),
	advice: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("dream_keywords_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("dream_keywords_keyword_idx").using("btree", table.keyword.asc().nullsLast().op("text_ops")),
	unique("dream_keywords_keyword_unique").on(table.keyword),
]);

export const dreamRecords = pgTable("dream_records", {
	id: serial().notNull(),
	userId: varchar("user_id", { length: 36 }),
	sessionId: varchar("session_id", { length: 100 }).notNull(),
	dreamContent: text("dream_content").notNull(),
	keywords: jsonb().notNull(),
	interpretation: text().notNull(),
	advice: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("dream_records_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("dream_records_session_idx").using("btree", table.sessionId.asc().nullsLast().op("text_ops")),
	index("dream_records_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const matchRecords = pgTable("match_records", {
	id: serial().notNull(),
	userId: varchar("user_id", { length: 36 }),
	sessionId: varchar("session_id", { length: 100 }).notNull(),
	name1: varchar({ length: 50 }).notNull(),
	birth1: varchar({ length: 20 }).notNull(),
	hour1: integer().notNull(),
	bazi1: jsonb().notNull(),
	name2: varchar({ length: 50 }).notNull(),
	birth2: varchar({ length: 20 }).notNull(),
	hour2: integer().notNull(),
	bazi2: jsonb().notNull(),
	score: integer().notNull(),
	level: varchar({ length: 20 }).notNull(),
	shengxiaoMatch: jsonb().notNull(),
	baziMatch: jsonb().notNull(),
	aiInterpretation: text(),
	advice: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("match_records_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("match_records_session_idx").using("btree", table.sessionId.asc().nullsLast().op("text_ops")),
	index("match_records_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);
