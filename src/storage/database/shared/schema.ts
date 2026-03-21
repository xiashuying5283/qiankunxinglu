import { pgTable, index, unique, serial, integer, varchar, text, jsonb, timestamp, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 生成 UUID 的函数
function gen_random_uuid() {
  return sql`gen_random_uuid()`;
}

// 科普词条表
export const glossary = pgTable("glossary", {
  id: serial().notNull(),
  term: varchar({ length: 50 }).notNull(),
  category: varchar({ length: 20 }).notNull(),
  shortDesc: text("short_desc").notNull(),
  fullDesc: text("full_desc").notNull(),
  origin: text(),
  examples: jsonb().default([]),
  relatedTerms: jsonb("related_terms").default([]),
  refs: jsonb().default([]),  // 参考文献（避免使用 references 保留字）
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  index("glossary_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
  index("glossary_term_idx").using("btree", table.term.asc().nullsLast().op("text_ops")),
  unique("glossary_term_unique").on(table.term),
]);

// 参考文献表
export const glossaryReferences = pgTable("glossary_references", {
  id: serial().notNull(),
  title: varchar({ length: 255 }).notNull(),
  author: varchar({ length: 100 }),
  publisher: varchar({ length: 100 }),
  year: varchar({ length: 20 }),
  isbn: varchar({ length: 20 }),
  url: text(),
  description: text(),
  category: varchar({ length: 50 }).default('general'),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  index("glossary_references_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
]);

// 用户贡献表
export const glossaryContributions = pgTable("glossary_contributions", {
  id: serial().notNull(),
  term: varchar({ length: 50 }).notNull(),
  category: varchar({ length: 20 }).notNull(),
  shortDesc: text("short_desc").notNull(),
  fullDesc: text("full_desc").notNull(),
  origin: text(),
  examples: jsonb().default([]),
  relatedTerms: jsonb("related_terms").default([]),
  refs: jsonb().default([]),  // 参考文献（避免使用 references 保留字）
  contributionType: varchar("contribution_type", { length: 20 }).default('add'),
  originalTermId: integer("original_term_id"),
  userId: varchar("user_id", { length: 36 }),
  userName: varchar("user_name", { length: 50 }),
  status: varchar({ length: 20 }).default('pending'),
  reviewerId: varchar("reviewer_id", { length: 36 }),
  reviewNote: text("review_note"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  index("glossary_contributions_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
  index("glossary_contributions_term_idx").using("btree", table.term.asc().nullsLast().op("text_ops")),
  index("glossary_contributions_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
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
	sessionId: varchar("session_id", { length: 100 }).notNull(),
	dreamContent: text("dream_content").notNull(),
	keywords: jsonb().notNull(),
	interpretation: text().notNull(),
	advice: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	userId: varchar("user_id", { length: 36 }),
}, (table) => [
	index("dream_records_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("dream_records_session_idx").using("btree", table.sessionId.asc().nullsLast().op("text_ops")),
	index("dream_records_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const matchRecords = pgTable("match_records", {
	id: serial().notNull(),
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
	userId: varchar("user_id", { length: 36 }),
}, (table) => [
	index("match_records_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("match_records_session_idx").using("btree", table.sessionId.asc().nullsLast().op("text_ops")),
	index("match_records_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const divinationRecords = pgTable("divination_records", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }),
	sessionId: varchar("session_id", { length: 100 }).notNull(),
	type: varchar({ length: 20 }).notNull(),
	question: text(),
	result: jsonb().notNull(),
	aiInterpretation: text("ai_interpretation"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("divination_records_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("divination_records_session_idx").using("btree", table.sessionId.asc().nullsLast().op("text_ops")),
	index("divination_records_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("divination_records_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const users = pgTable("users", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	email: varchar({ length: 255 }),
	password: text(),
	name: varchar({ length: 50 }),
	isGuest: boolean("is_guest").default(false).notNull(),
	sessionId: varchar("session_id", { length: 100 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	avatar: text(),
	provider: varchar({ length: 20 }),
	providerId: varchar("provider_id", { length: 100 }),
	resetToken: varchar("reset_token", { length: 100 }),
	resetTokenExpires: timestamp("reset_token_expires", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_provider_idx").using("btree", table.provider.asc().nullsLast().op("text_ops")),
	index("users_reset_token_idx").using("btree", table.resetToken.asc().nullsLast().op("text_ops")),
	index("users_session_idx").using("btree", table.sessionId.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
	unique("users_session_id_unique").on(table.sessionId),
]);

// API 凭证表（HMAC 签名认证）
export const apiCredentials = pgTable("api_credentials", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	accessKey: varchar("access_key", { length: 50 }).notNull(),
	secretKey: text("secret_key").notNull(),
	secretKeyHash: varchar("secret_key_hash", { length: 100 }).notNull(),
	name: varchar({ length: 100 }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	revokedAt: timestamp("revoked_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("api_credentials_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("api_credentials_access_key_idx").using("btree", table.accessKey.asc().nullsLast().op("text_ops")),
	unique("api_credentials_access_key_unique").on(table.accessKey),
]);

// 古籍阅读系统表

// 书籍表
export const books = pgTable("books", {
	id: serial().notNull(),
	title: varchar({ length: 255 }).notNull(),
	titlePinyin: varchar("title_pinyin", { length: 255 }),
	author: varchar({ length: 100 }),
	dynasty: varchar({ length: 50 }),
	category: varchar({ length: 50 }),
	description: text(),
	coverUrl: varchar("cover_url", { length: 500 }),
	totalChapters: integer("total_chapters").default(0),
	status: varchar({ length: 20 }).default('active'),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("books_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("books_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
]);

// 章节表（支持多级目录）
export const chapters = pgTable("chapters", {
	id: serial().notNull(),
	bookId: integer("book_id").notNull(),
	parentId: integer("parent_id"),
	title: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 100 }),
	chapterOrder: integer("chapter_order").default(0),
	level: integer().default(1),
	isLeaf: boolean("is_leaf").default(false),
	wordCount: integer("word_count").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("chapters_book_id_idx").using("btree", table.bookId.asc().nullsLast().op("int4_ops")),
	index("chapters_parent_id_idx").using("btree", table.parentId.asc().nullsLast().op("int4_ops")),
]);

// 内容表
export const bookContents = pgTable("book_contents", {
	id: serial().notNull(),
	chapterId: integer("chapter_id").notNull(),
	contentType: varchar("content_type", { length: 20 }).notNull(),
	content: text().notNull(),
	source: varchar({ length: 100 }),
	contentOrder: integer("content_order").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("book_contents_chapter_id_idx").using("btree", table.chapterId.asc().nullsLast().op("int4_ops")),
	index("book_contents_type_idx").using("btree", table.chapterId.asc().nullsLast().op("int4_ops"), table.contentType.asc().nullsLast().op("text_ops")),
]);
