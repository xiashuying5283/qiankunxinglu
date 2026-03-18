import { pgTable, serial, integer, varchar, text, jsonb, timestamp, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 系统健康检查表（Supabase 内置，请勿删除）
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 爻辞结构
export interface HexagramLine {
	text: string;       // 原文
	meaning: string;    // 白话解释
}

// 64卦数据表
export const hexagrams = pgTable(
	"hexagrams",
	{
		id: serial().notNull(),
		number: integer("number").notNull().unique(),        // 卦序 1-64
		name: varchar("name", { length: 20 }).notNull(),      // 卦名
		symbol: varchar("symbol", { length: 10 }).notNull(),  // Unicode符号
		upperTrigram: varchar("upper_trigram", { length: 10 }).notNull(),  // 上卦
		lowerTrigram: varchar("lower_trigram", { length: 10 }).notNull(),  // 下卦
		binary: varchar("binary", { length: 10 }).notNull(),  // 二进制表示
		judgement: text("judgement").notNull(),               // 卦辞
		judgementMeaning: text("judgement_meaning").notNull(),// 卦辞白话解释
		image: text("image").notNull(),                       // 象辞
		imageMeaning: text("image_meaning").notNull(),        // 象辞白话解释
		lines: jsonb("lines").notNull().$type<HexagramLine[]>(), // 爻辞（6条）
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => [
		index("hexagrams_number_idx").on(table.number),
		index("hexagrams_name_idx").on(table.name),
	]
);

// 八卦数据表
export const trigrams = pgTable(
	"trigrams",
	{
		id: serial().notNull(),
		number: integer("number").notNull().unique(),         // 数字代表 1-8
		name: varchar("name", { length: 10 }).notNull(),       // 卦名
		symbol: varchar("symbol", { length: 10 }).notNull(),   // Unicode符号
		nature: varchar("nature", { length: 10 }).notNull(),   // 自然象征
		attribute: varchar("attribute", { length: 20 }).notNull(), // 属性
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	},
	(table) => [
		index("trigrams_number_idx").on(table.number),
	]
);

// 类型导出
export type Hexagram = typeof hexagrams.$inferSelect;
export type Trigram = typeof trigrams.$inferSelect;
