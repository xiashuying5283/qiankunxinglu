import { pgTable, index, unique, serial, integer, varchar, text, jsonb, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



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

// 观音灵签数据表
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
	index("fortune_sticks_number_idx").using("btree", table.number.asc().nullsLast().op("int4_ops")),
	index("fortune_sticks_level_idx").using("btree", table.level.asc().nullsLast().op("text_ops")),
	unique("fortune_sticks_number_unique").on(table.number),
]);

// 梦境关键词表
export const dreamKeywords = pgTable("dream_keywords", {
	id: serial().notNull(),
	keyword: varchar({ length: 50 }).notNull(),
	category: varchar({ length: 20 }).notNull(), // 自然、动物、人物、情景、物品
	meaning: text().notNull(),
	advice: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("dream_keywords_keyword_idx").using("btree", table.keyword.asc().nullsLast().op("text_ops")),
	index("dream_keywords_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	unique("dream_keywords_keyword_unique").on(table.keyword),
]);

// 梦境记录表
export const dreamRecords = pgTable("dream_records", {
	id: serial().notNull(),
	sessionId: varchar("session_id", { length: 100 }).notNull(), // 用户会话ID
	dreamContent: text("dream_content").notNull(), // 梦境内容描述
	keywords: jsonb().notNull().$type<string[]>(), // 提取的关键词
	interpretation: text().notNull(), // AI解析结果
	advice: text().notNull(), // 建议
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("dream_records_session_idx").using("btree", table.sessionId.asc().nullsLast().op("text_ops")),
	index("dream_records_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
]);
