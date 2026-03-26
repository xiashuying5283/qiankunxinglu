import { pgTable, index, unique, serial, integer, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 生成 UUID 的函数
function gen_random_uuid() {
  return sql`gen_random_uuid()`;
}

// ==================== 游戏化系统表 ====================

/**
 * 用户货币表
 * 存储用户的卦币余额和灵石余额
 */
export const userCurrency = pgTable("user_currency", {
  id: serial().notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  // 卦币：基础货币，通过签到、占卜、看知识获得
  guaCoins: integer("gua_coins").default(0).notNull(),
  // 灵石：高级货币，通过分享、充值获得
  spiritStones: integer("spirit_stones").default(0).notNull(),
  // 总获得卦币（用于统计）
  totalGuaCoins: integer("total_gua_coins").default(0).notNull(),
  // 总获得灵石
  totalSpiritStones: integer("total_spirit_stones").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  index("user_currency_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
  unique("user_currency_user_unique").on(table.userId),
]);

/**
 * 货币交易记录表
 * 记录所有货币变动
 */
export const currencyTransactions = pgTable("currency_transactions", {
  id: serial().notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  // 货币类型：gua_coins / spirit_stones
  currencyType: varchar("currency_type", { length: 20 }).notNull(),
  // 变动数量（正数为获得，负数为消费）
  amount: integer().notNull(),
  // 交易后余额
  balanceAfter: integer("balance_after").notNull(),
  // 交易类型：sign_in, divination, read_knowledge, share, consume, reward
  transactionType: varchar("transaction_type", { length: 30 }).notNull(),
  // 关联ID（如签到记录ID、占卜记录ID等）
  relatedId: varchar("related_id", { length: 100 }),
  // 描述
  description: text(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  index("currency_transactions_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
  index("currency_transactions_type_idx").using("btree", table.transactionType.asc().nullsLast().op("text_ops")),
  index("currency_transactions_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
]);

/**
 * 用户等级表
 * 记录用户的成长等级和经验值
 */
export const userLevels = pgTable("user_levels", {
  id: serial().notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  // 当前等级
  level: integer().default(1).notNull(),
  // 当前经验值
  experience: integer().default(0).notNull(),
  // 总经验值
  totalExperience: integer("total_experience").default(0).notNull(),
  // 占卜总次数
  divinationCount: integer("divination_count").default(0).notNull(),
  // 签到总天数
  signInDays: integer("sign_in_days").default(0).notNull(),
  // 阅读知识总次数
  readKnowledgeCount: integer("read_knowledge_count").default(0).notNull(),
  // 分享总次数
  shareCount: integer("share_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  index("user_levels_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
  unique("user_levels_user_unique").on(table.userId),
]);

/**
 * 签到记录表
 */
export const signInRecords = pgTable("sign_in_records", {
  id: serial().notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  // 签到日期 YYYY-MM-DD
  signInDate: varchar("sign_in_date", { length: 10 }).notNull(),
  // 连续签到天数
  continuousDays: integer("continuous_days").default(1).notNull(),
  // 获得的卦币
  guaCoinsEarned: integer("gua_coins_earned").default(0).notNull(),
  // 是否获得额外奖励（7天、30天）
  bonusAwarded: boolean("bonus_awarded").default(false),
  // 奖励类型：seven_days / thirty_days
  bonusType: varchar("bonus_type", { length: 20 }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  index("sign_in_records_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
  index("sign_in_records_date_idx").using("btree", table.signInDate.asc().nullsLast().op("text_ops")),
  unique("sign_in_records_user_date_unique").on(table.userId, table.signInDate),
]);

// ==================== 常量定义 ====================

/**
 * 等级配置
 */
export const LEVEL_CONFIG = {
  1: { name: '入门弟子', minExp: 0, maxExp: 100, privilege: '基础占卜功能' },
  2: { name: '六爻学徒', minExp: 100, maxExp: 300, privilege: '每日额外1次免费占卜' },
  3: { name: '周易卦师', minExp: 300, maxExp: 600, privilege: '每日额外2次免费占卜' },
  4: { name: '精通大师', minExp: 600, maxExp: 1000, privilege: '解锁专属解卦模板' },
  5: { name: '一代宗师', minExp: 1000, maxExp: 2000, privilege: '免费高级详批每月1次' },
  6: { name: '玄学泰斗', minExp: 2000, maxExp: 5000, privilege: '所有功能免费无限使用' },
  7: { name: '天人合一', minExp: 5000, maxExp: Infinity, privilege: '专属称号与标识' },
} as const;

/**
 * 签到奖励配置
 */
export const SIGN_IN_REWARDS = {
  // 每日基础奖励
  daily: {
    guaCoins: 10,
  },
  // 连续签到奖励
  continuous: {
    2: { guaCoins: 15 },   // 连续2天
    3: { guaCoins: 20 },   // 连续3天
    4: { guaCoins: 25 },   // 连续4天
    5: { guaCoins: 30 },   // 连续5天
    6: { guaCoins: 35 },   // 连续6天
    7: { guaCoins: 50, bonus: 'free_interpretation' }, // 连续7天：免费高级解读
  },
  // 里程碑奖励
  milestones: {
    7: { guaCoins: 100, bonus: 'free_interpretation' },   // 累计7天
    30: { guaCoins: 500, bonus: 'free_bazi_report' },     // 累计30天：免费八字报告
    100: { guaCoins: 2000, bonus: 'free_match_report' },  // 累计100天：免费合婚报告
    365: { guaCoins: 10000, bonus: 'vip_month' },         // 累计365天：VIP月卡
  },
} as const;

/**
 * 经验值获取配置
 */
export const EXP_REWARDS = {
  signIn: 10,           // 签到
  divination: 5,        // 占卜
  readKnowledge: 2,     // 阅读知识
  share: 20,            // 分享
  firstSignInOfDay: 20, // 当日首次签到
} as const;

/**
 * 卦币获取配置
 */
export const COIN_REWARDS = {
  signIn: 10,           // 签到基础
  divination: 5,        // 占卜
  readKnowledge: 2,     // 阅读知识
  share: 30,            // 分享
} as const;

/**
 * 卦币消费配置
 */
export const COIN_COSTS = {
  advancedInterpretation: 50,  // 高级解读
  extraDivination: 20,         // 额外占卜
  baziReport: 100,             // 八字终身盘
  matchReport: 150,            // 合婚报告
} as const;
