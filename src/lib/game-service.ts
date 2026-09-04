/**
 * 游戏化系统服务
 * 
 * 包含三个核心体系：
 * 1. 虚拟货币体系：卦币/灵石
 * 2. 成长称号体系：从入门弟子到天人合一
 * 3. 每日签到体系：连续签到奖励
 */

import { getPgClient } from '@/storage/database/pg-client';

// ==================== 类型定义 ====================

/** 用户货币信息 */
export interface UserCurrency {
  guaCoins: number;
  spiritStones: number;
  totalGuaCoins: number;
  totalSpiritStones: number;
}

/** 用户等级信息 */
export interface UserLevel {
  level: number;
  experience: number;
  totalExperience: number;
  divinationCount: number;
  signInDays: number;
  readKnowledgeCount: number;
  shareCount: number;
  title: string;
  nextLevelExp: number;
  progress: number;
}

/** 签到结果 */
export interface SignInResult {
  success: boolean;
  guaCoinsEarned: number;
  continuousDays: number;
  totalSignInDays: number;
  bonusAwarded: boolean;
  bonusType?: string;
  bonusDescription?: string;
  alreadySignedIn?: boolean;
}

/** 等级配置 */
export interface LevelConfig {
  name: string;
  minExp: number;
  maxExp: number;
  privilege: string;
}

// ==================== 常量配置 ====================

/** 等级配置 */
export const LEVEL_CONFIG: Record<number, LevelConfig> = {
  1: { name: '入门弟子', minExp: 0, maxExp: 100, privilege: '基础占卜功能' },
  2: { name: '六爻学徒', minExp: 100, maxExp: 300, privilege: '每日额外1次免费占卜' },
  3: { name: '周易卦师', minExp: 300, maxExp: 600, privilege: '每日额外2次免费占卜' },
  4: { name: '精通大师', minExp: 600, maxExp: 1000, privilege: '解锁专属解卦模板' },
  5: { name: '一代宗师', minExp: 1000, maxExp: 2000, privilege: '免费高级详批每月1次' },
  6: { name: '玄学泰斗', minExp: 2000, maxExp: 5000, privilege: '所有功能免费无限使用' },
  7: { name: '天人合一', minExp: 5000, maxExp: Infinity, privilege: '专属称号与标识' },
};

/** 签到奖励配置 */
export const SIGN_IN_REWARDS = {
  // 每日基础奖励
  daily: 10,
  // 连续签到奖励（天数: 卦币数）
  continuous: {
    2: 15,
    3: 20,
    4: 25,
    5: 30,
    6: 35,
    7: 50,
  } as Record<number, number>,
  // 里程碑奖励
  milestones: {
    7: { guaCoins: 100, bonus: 'free_interpretation', desc: '免费高级解读1次' },
    30: { guaCoins: 500, bonus: 'free_bazi_report', desc: '免费八字终身盘1次' },
    100: { guaCoins: 2000, bonus: 'free_match_report', desc: '免费合婚报告1次' },
    365: { guaCoins: 10000, bonus: 'vip_month', desc: 'VIP月卡' },
  } as Record<number, { guaCoins: number; bonus: string; desc: string }>,
};

/** 经验值获取配置 */
export const EXP_REWARDS = {
  signIn: 10,
  divination: 5,
  readKnowledge: 2,
  share: 20,
  firstSignInOfDay: 20,
};

/** 卦币获取配置 */
export const COIN_REWARDS = {
  signIn: 10,
  divination: 5,
  readKnowledge: 2,
  share: 30,
};

/** 卦币消费配置 */
export const COIN_COSTS = {
  advancedInterpretation: 50,
  extraDivination: 20,
  baziReport: 100,
  matchReport: 150,
};

// ==================== 辅助函数 ====================

/** 获取等级名称 */
export function getLevelTitle(level: number): string {
  return LEVEL_CONFIG[level]?.name || '入门弟子';
}

/** 根据经验值计算等级 */
export function calculateLevel(experience: number): number {
  for (let level = 7; level >= 1; level--) {
    if (experience >= LEVEL_CONFIG[level].minExp) {
      return level;
    }
  }
  return 1;
}

/** 获取下一等级所需经验 */
export function getNextLevelExp(level: number): number {
  if (level >= 7) return 0;
  return LEVEL_CONFIG[level + 1]?.minExp || 0;
}

/** 获取当前等级进度 */
export function getLevelProgress(experience: number, level: number): number {
  const config = LEVEL_CONFIG[level];
  if (!config) return 0;
  
  const currentLevelExp = experience - config.minExp;
  const levelRange = config.maxExp === Infinity ? 1000 : config.maxExp - config.minExp;
  
  return Math.min(100, Math.round((currentLevelExp / levelRange) * 100));
}

// ==================== 服务类 ====================

class GameService {
  
  /** 表是否已初始化 */
  private tablesInitialized = false;

  /**
   * 检查表是否存在
   */
  private async checkTablesExist(): Promise<boolean> {
    if (this.tablesInitialized) return true;
    
    const db = getPgClient();
    const { error } = await db
      .from('user_currency')
      .select('id')
      .limit(1);
    
    if (error && error.message?.includes('Could not find')) {
      console.error('游戏化系统表不存在，请执行 scripts/init-game-db.sql');
      return false;
    }
    
    this.tablesInitialized = true;
    return true;
  }

  /**
   * 确保用户货币记录存在
   */
  private async ensureCurrencyRecord(userId: string): Promise<boolean> {
    const tablesExist = await this.checkTablesExist();
    if (!tablesExist) return false;
    
    const db = getPgClient();
    
    const { data, error } = await db
      .from('user_currency')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // 记录不存在，创建新记录
      const { error: insertError } = await db
        .from('user_currency')
        .insert({
          user_id: userId,
          gua_coins: 0,
          spirit_stones: 0,
          total_gua_coins: 0,
          total_spirit_stones: 0,
        });
      
      if (insertError) {
        console.error('创建货币记录失败:', insertError);
        return false;
      }
    }
    
    return true;
  }

  /**
   * 确保用户等级记录存在
   */
  private async ensureLevelRecord(userId: string): Promise<boolean> {
    const tablesExist = await this.checkTablesExist();
    if (!tablesExist) return false;
    
    const db = getPgClient();
    
    const { data, error } = await db
      .from('user_levels')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // 记录不存在，创建新记录
      const { error: insertError } = await db
        .from('user_levels')
        .insert({
          user_id: userId,
          level: 1,
          experience: 0,
          total_experience: 0,
          divination_count: 0,
          sign_in_days: 0,
          read_knowledge_count: 0,
          share_count: 0,
        });
      
      if (insertError) {
        console.error('创建等级记录失败:', insertError);
        return false;
      }
    }
    
    return true;
  }

  // ==================== 货币相关 ====================

  /**
   * 获取用户货币信息
   */
  async getCurrency(userId: string): Promise<UserCurrency> {
    const success = await this.ensureCurrencyRecord(userId);
    if (!success) {
      return { guaCoins: 0, spiritStones: 0, totalGuaCoins: 0, totalSpiritStones: 0 };
    }
    
    const db = getPgClient();
    const { data, error } = await db
      .from('user_currency')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('获取用户货币失败:', error);
      return { guaCoins: 0, spiritStones: 0, totalGuaCoins: 0, totalSpiritStones: 0 };
    }
    
    return {
      guaCoins: data.gua_coins || 0,
      spiritStones: data.spirit_stones || 0,
      totalGuaCoins: data.total_gua_coins || 0,
      totalSpiritStones: data.total_spirit_stones || 0,
    };
  }

  /**
   * 增加卦币
   */
  async addGuaCoins(
    userId: string, 
    amount: number, 
    transactionType: string,
    relatedId?: string,
    description?: string
  ): Promise<number> {
    await this.ensureCurrencyRecord(userId);
    
    const db = getPgClient();
    
    // 获取当前余额
    const { data: current } = await db
      .from('user_currency')
      .select('gua_coins, total_gua_coins')
      .eq('user_id', userId)
      .single();
    
    const newBalance = (current?.gua_coins || 0) + amount;
    const newTotal = (current?.total_gua_coins || 0) + amount;
    
    // 更新余额
    await db
      .from('user_currency')
      .update({ 
        gua_coins: newBalance, 
        total_gua_coins: newTotal,
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    // 记录交易
    await db
      .from('currency_transactions')
      .insert({
        user_id: userId,
        currency_type: 'gua_coins',
        amount,
        balance_after: newBalance,
        transaction_type: transactionType,
        related_id: relatedId,
        description,
      });
    
    return newBalance;
  }

  /**
   * 消费卦币
   */
  async consumeGuaCoins(
    userId: string,
    amount: number,
    transactionType: string,
    relatedId?: string,
    description?: string
  ): Promise<{ success: boolean; balance: number; message?: string }> {
    await this.ensureCurrencyRecord(userId);
    
    const db = getPgClient();
    
    // 获取当前余额
    const { data: current } = await db
      .from('user_currency')
      .select('gua_coins')
      .eq('user_id', userId)
      .single();
    
    const currentBalance = current?.gua_coins || 0;
    
    if (currentBalance < amount) {
      return { 
        success: false, 
        balance: currentBalance, 
        message: '卦币不足' 
      };
    }
    
    const newBalance = currentBalance - amount;
    
    // 更新余额
    await db
      .from('user_currency')
      .update({ 
        gua_coins: newBalance,
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    // 记录交易
    await db
      .from('currency_transactions')
      .insert({
        user_id: userId,
        currency_type: 'gua_coins',
        amount: -amount,
        balance_after: newBalance,
        transaction_type: transactionType,
        related_id: relatedId,
        description,
      });
    
    return { success: true, balance: newBalance };
  }

  // ==================== 等级相关 ====================

  /**
   * 获取用户等级信息
   */
  async getLevel(userId: string): Promise<UserLevel> {
    const success = await this.ensureLevelRecord(userId);
    if (!success) {
      return {
        level: 1,
        experience: 0,
        totalExperience: 0,
        divinationCount: 0,
        signInDays: 0,
        readKnowledgeCount: 0,
        shareCount: 0,
        title: '入门弟子',
        nextLevelExp: 100,
        progress: 0,
      };
    }
    
    const db = getPgClient();
    const { data, error } = await db
      .from('user_levels')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('获取用户等级失败:', error);
      return {
        level: 1,
        experience: 0,
        totalExperience: 0,
        divinationCount: 0,
        signInDays: 0,
        readKnowledgeCount: 0,
        shareCount: 0,
        title: '入门弟子',
        nextLevelExp: 100,
        progress: 0,
      };
    }
    
    const level = calculateLevel(data.total_experience || 0);
    
    return {
      level,
      experience: data.experience || 0,
      totalExperience: data.total_experience || 0,
      divinationCount: data.divination_count || 0,
      signInDays: data.sign_in_days || 0,
      readKnowledgeCount: data.read_knowledge_count || 0,
      shareCount: data.share_count || 0,
      title: getLevelTitle(level),
      nextLevelExp: getNextLevelExp(level),
      progress: getLevelProgress(data.total_experience || 0, level),
    };
  }

  /**
   * 增加经验值
   */
  async addExperience(userId: string, amount: number): Promise<{ newLevel: number; levelUp: boolean }> {
    await this.ensureLevelRecord(userId);
    
    const db = getPgClient();
    
    // 获取当前经验
    const { data: current } = await db
      .from('user_levels')
      .select('level, experience, total_experience')
      .eq('user_id', userId)
      .single();
    
    const oldLevel = calculateLevel(current?.total_experience || 0);
    const newTotalExp = (current?.total_experience || 0) + amount;
    const newLevel = calculateLevel(newTotalExp);
    
    // 更新经验值
    await db
      .from('user_levels')
      .update({ 
        experience: (current?.experience || 0) + amount,
        total_experience: newTotalExp,
        level: newLevel,
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    return { 
      newLevel, 
      levelUp: newLevel > oldLevel 
    };
  }

  /**
   * 增加占卜次数
   */
  async incrementDivinationCount(userId: string): Promise<void> {
    await this.ensureLevelRecord(userId);
    
    const db = getPgClient();
    
    await db.rpc('increment_divination_count', { user_id: userId });
  }

  // ==================== 签到相关 ====================

  /**
   * 检查今日是否已签到
   */
  async hasSignedInToday(userId: string): Promise<boolean> {
    const tablesExist = await this.checkTablesExist();
    if (!tablesExist) return false;
    
    const today = new Date().toISOString().split('T')[0];
    
    const db = getPgClient();
    const { data, error } = await db
      .from('sign_in_records')
      .select('id')
      .eq('user_id', userId)
      .eq('sign_in_date', today)
      .single();
    
    return !error && !!data;
  }

  /**
   * 获取签到状态
   */
  async getSignInStatus(userId: string): Promise<{
    hasSignedIn: boolean;
    continuousDays: number;
    totalDays: number;
    todayRewards: number;
  }> {
    const tablesExist = await this.checkTablesExist();
    if (!tablesExist) {
      return {
        hasSignedIn: false,
        continuousDays: 0,
        totalDays: 0,
        todayRewards: SIGN_IN_REWARDS.daily,
      };
    }
    
    const hasSignedIn = await this.hasSignedInToday(userId);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const db = getPgClient();
    
    // 获取用户等级信息（包含总签到天数）
    const levelInfo = await this.getLevel(userId);
    
    // 获取最近的签到记录
    const { data: lastRecord } = await db
      .from('sign_in_records')
      .select('continuous_days, sign_in_date')
      .eq('user_id', userId)
      .order('sign_in_date', { ascending: false })
      .limit(1)
      .single();
    
    let continuousDays = 0;
    
    if (lastRecord) {
      if (lastRecord.sign_in_date === yesterday) {
        // 昨天签到了，连续天数+1
        continuousDays = lastRecord.continuous_days;
      } else if (lastRecord.sign_in_date === today) {
        // 今天已经签到了
        continuousDays = lastRecord.continuous_days;
      }
      // 否则连续天数重置为0
    }
    
    // 计算今日可获得奖励
    const todayRewards = this.calculateSignInReward(continuousDays + 1);
    
    return {
      hasSignedIn,
      continuousDays: hasSignedIn ? continuousDays : 0,
      totalDays: levelInfo.signInDays,
      todayRewards,
    };
  }

  /**
   * 计算签到奖励
   */
  private calculateSignInReward(continuousDays: number): number {
    // 7天一个周期，循环奖励
    const dayInCycle = continuousDays % 7 || 7;
    
    if (dayInCycle === 7) {
      return SIGN_IN_REWARDS.continuous[7] || SIGN_IN_REWARDS.daily;
    }
    
    return SIGN_IN_REWARDS.continuous[dayInCycle] || SIGN_IN_REWARDS.daily;
  }

  /**
   * 执行签到
   */
  async signIn(userId: string): Promise<SignInResult> {
    // 检查表是否存在
    const tablesExist = await this.checkTablesExist();
    if (!tablesExist) {
      return {
        success: false,
        alreadySignedIn: false,
        guaCoinsEarned: 0,
        continuousDays: 0,
        totalSignInDays: 0,
        bonusAwarded: false,
      };
    }
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // 检查是否已签到
    const hasSignedIn = await this.hasSignedInToday(userId);
    if (hasSignedIn) {
      const status = await this.getSignInStatus(userId);
      return {
        success: false,
        alreadySignedIn: true,
        guaCoinsEarned: 0,
        continuousDays: status.continuousDays,
        totalSignInDays: status.totalDays,
        bonusAwarded: false,
      };
    }
    
    const db = getPgClient();
    
    // 获取昨日签到记录
    const { data: yesterdayRecord } = await db
      .from('sign_in_records')
      .select('continuous_days')
      .eq('user_id', userId)
      .eq('sign_in_date', yesterday)
      .single();
    
    // 计算连续签到天数
    let continuousDays = 1;
    if (yesterdayRecord) {
      continuousDays = yesterdayRecord.continuous_days + 1;
    }
    
    // 计算奖励
    let guaCoinsEarned = this.calculateSignInReward(continuousDays);
    let bonusAwarded = false;
    let bonusType: string | undefined;
    let bonusDescription: string | undefined;
    
    // 检查里程碑奖励
    const levelSuccess = await this.ensureLevelRecord(userId);
    const { data: levelData } = await db
      .from('user_levels')
      .select('sign_in_days')
      .eq('user_id', userId)
      .single();
    
    const totalSignInDays = (levelData?.sign_in_days || 0) + 1;
    
    const milestone = SIGN_IN_REWARDS.milestones[totalSignInDays];
    if (milestone) {
      guaCoinsEarned += milestone.guaCoins;
      bonusAwarded = true;
      bonusType = milestone.bonus;
      bonusDescription = milestone.desc;
    }
    
    // 创建签到记录
    const { error: insertError } = await db
      .from('sign_in_records')
      .insert({
        user_id: userId,
        sign_in_date: today,
        continuous_days: continuousDays,
        gua_coins_earned: guaCoinsEarned,
        bonus_awarded: bonusAwarded,
        bonus_type: bonusType,
      });
    
    if (insertError) {
      console.error('创建签到记录失败:', insertError);
      return {
        success: false,
        alreadySignedIn: false,
        guaCoinsEarned: 0,
        continuousDays: 0,
        totalSignInDays: 0,
        bonusAwarded: false,
      };
    }
    
    // 增加卦币
    await this.addGuaCoins(userId, guaCoinsEarned, 'sign_in', today, `每日签到（连续${continuousDays}天）`);
    
    // 增加经验值
    await this.addExperience(userId, EXP_REWARDS.signIn);
    
    // 更新签到天数
    await db
      .from('user_levels')
      .update({ 
        sign_in_days: totalSignInDays,
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    return {
      success: true,
      guaCoinsEarned,
      continuousDays,
      totalSignInDays,
      bonusAwarded,
      bonusType,
      bonusDescription,
    };
  }

  // ==================== 其他操作 ====================

  /**
   * 记录占卜行为（增加经验+卦币）
   */
  async recordDivination(userId: string): Promise<void> {
    await this.ensureLevelRecord(userId);
    
    const db = getPgClient();
    
    // 增加占卜次数
    const { data } = await db
      .from('user_levels')
      .select('divination_count')
      .eq('user_id', userId)
      .single();
    
    await db
      .from('user_levels')
      .update({ 
        divination_count: (data?.divination_count || 0) + 1,
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    // 增加经验和卦币
    await this.addExperience(userId, EXP_REWARDS.divination);
    await this.addGuaCoins(userId, COIN_REWARDS.divination, 'divination');
  }

  /**
   * 记录阅读知识行为
   */
  async recordReadKnowledge(userId: string): Promise<void> {
    await this.ensureLevelRecord(userId);
    
    const db = getPgClient();
    
    const { data } = await db
      .from('user_levels')
      .select('read_knowledge_count')
      .eq('user_id', userId)
      .single();
    
    await db
      .from('user_levels')
      .update({ 
        read_knowledge_count: (data?.read_knowledge_count || 0) + 1,
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    await this.addExperience(userId, EXP_REWARDS.readKnowledge);
    await this.addGuaCoins(userId, COIN_REWARDS.readKnowledge, 'read_knowledge');
  }

  /**
   * 记录分享行为
   */
  async recordShare(userId: string): Promise<void> {
    await this.ensureLevelRecord(userId);
    
    const db = getPgClient();
    
    const { data } = await db
      .from('user_levels')
      .select('share_count')
      .eq('user_id', userId)
      .single();
    
    await db
      .from('user_levels')
      .update({ 
        share_count: (data?.share_count || 0) + 1,
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    await this.addExperience(userId, EXP_REWARDS.share);
    await this.addGuaCoins(userId, COIN_REWARDS.share, 'share');
  }
}

// 导出单例
export const gameService = new GameService();
