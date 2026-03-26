'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Coins, Star, TrendingUp, Calendar } from 'lucide-react';
import { SignInDialog } from './SignInDialog';

/** 游戏状态类型 */
export interface GameState {
  currency: {
    guaCoins: number;
    spiritStones: number;
    totalGuaCoins: number;
    totalSpiritStones: number;
  };
  level: {
    level: number;
    title: string;
    experience: number;
    totalExperience: number;
    nextLevelExp: number;
    progress: number;
    divinationCount: number;
    signInDays: number;
  };
  signIn: {
    hasSignedIn: boolean;
    continuousDays: number;
    totalDays: number;
    todayRewards: number;
  };
}

/** 游戏状态上下文 */
const GameContext = createContext<{
  gameState: GameState | null;
  loading: boolean;
  refresh: () => Promise<void>;
  showSignIn: () => void;
}>({
  gameState: null,
  loading: true,
  refresh: async () => {},
  showSignIn: () => {},
});

/** 游戏状态提供者 */
export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInOpen, setSignInOpen] = useState(false);

  const refresh = async () => {
    try {
      const res = await fetch('/api/game/status');
      const data = await res.json();
      if (data.success) {
        setGameState(data.data);
      }
    } catch (error) {
      console.error('获取游戏状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const showSignIn = () => {
    setSignInOpen(true);
  };

  return (
    <GameContext.Provider value={{ gameState, loading, refresh, showSignIn }}>
      {children}
      <SignInDialog 
        open={signInOpen} 
        onOpenChange={setSignInOpen}
        onSignInSuccess={refresh}
      />
    </GameContext.Provider>
  );
}

/** 使用游戏状态 */
export function useGame() {
  return useContext(GameContext);
}

/** 货币显示组件 */
export function CurrencyDisplay({ compact = false }: { compact?: boolean }) {
  const { gameState, loading, showSignIn } = useGame();

  if (loading || !gameState) {
    return (
      <div className="flex items-center gap-2 text-sm text-white/50">
        <Coins className="w-4 h-4 animate-pulse" />
        <span>--</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* 卦币 */}
      <div className="flex items-center gap-1.5 bg-amber-500/20 px-3 py-1.5 rounded-full">
        <Coins className="w-4 h-4 text-amber-400" />
        <span className="text-amber-100 font-medium text-sm">
          {gameState.currency.guaCoins.toLocaleString()}
        </span>
      </div>

      {/* 签到按钮 */}
      {!gameState.signIn.hasSignedIn && (
        <button
          onClick={showSignIn}
          className="flex items-center gap-1.5 bg-green-500/20 hover:bg-green-500/30 px-3 py-1.5 rounded-full transition-colors"
        >
          <Calendar className="w-4 h-4 text-green-400" />
          <span className="text-green-100 text-sm">签到</span>
        </button>
      )}
    </div>
  );
}

/** 等级显示组件 */
export function LevelDisplay({ showProgress = true }: { showProgress?: boolean }) {
  const { gameState, loading } = useGame();

  if (loading || !gameState) {
    return (
      <div className="flex items-center gap-2 text-sm text-white/50">
        <Star className="w-4 h-4 animate-pulse" />
        <span>--</span>
      </div>
    );
  }

  const { level } = gameState;

  // 根据等级选择颜色
  const getLevelColor = (lvl: number) => {
    if (lvl >= 7) return 'from-purple-500 to-pink-500';
    if (lvl >= 5) return 'from-amber-500 to-orange-500';
    if (lvl >= 3) return 'from-blue-500 to-cyan-500';
    return 'from-green-500 to-emerald-500';
  };

  return (
    <div className="flex items-center gap-3">
      {/* 等级徽章 */}
      <div className={`flex items-center gap-2 bg-gradient-to-r ${getLevelColor(level.level)} px-3 py-1.5 rounded-full`}>
        <Star className="w-4 h-4 text-white fill-white" />
        <span className="text-white font-medium text-sm">{level.title}</span>
      </div>

      {/* 经验进度条 */}
      {showProgress && level.level < 7 && (
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
              style={{ width: `${level.progress}%` }}
            />
          </div>
          <span className="text-xs text-white/60">
            {level.totalExperience}/{level.nextLevelExp}
          </span>
        </div>
      )}
    </div>
  );
}

/** 游戏状态面板（用于个人中心等） */
export function GameStatsPanel() {
  const { gameState, loading, showSignIn } = useGame();

  if (loading || !gameState) {
    return (
      <div className="bg-white/10 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-white/20 rounded w-1/2 mb-4" />
        <div className="h-8 bg-white/20 rounded w-3/4" />
      </div>
    );
  }

  const { currency, level, signIn } = gameState;

  return (
    <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 rounded-lg p-6 border border-amber-400/20">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-amber-100">我的修行</h3>
        {!signIn.hasSignedIn && (
          <button
            onClick={showSignIn}
            className="text-sm bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
          >
            <Calendar className="w-4 h-4" />
            待签到
          </button>
        )}
      </div>

      {/* 货币信息 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-amber-950/40 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Coins className="w-4 h-4" />
            <span className="text-sm">卦币</span>
          </div>
          <p className="text-2xl font-bold text-amber-100">
            {currency.guaCoins.toLocaleString()}
          </p>
          <p className="text-xs text-amber-400/60 mt-1">
            累计获得 {currency.totalGuaCoins.toLocaleString()}
          </p>
        </div>

        <div className="bg-purple-950/40 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <Star className="w-4 h-4" />
            <span className="text-sm">灵石</span>
          </div>
          <p className="text-2xl font-bold text-purple-100">
            {currency.spiritStones.toLocaleString()}
          </p>
          <p className="text-xs text-purple-400/60 mt-1">
            累计获得 {currency.totalSpiritStones.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 等级信息 */}
      <div className="bg-amber-950/40 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-amber-100 font-medium">{level.title}</span>
            <span className="text-xs text-amber-400/60">Lv.{level.level}</span>
          </div>
          {level.level < 7 && (
            <span className="text-xs text-amber-400/60">
              距离下一级还需 {level.nextLevelExp - level.totalExperience} 经验
            </span>
          )}
        </div>
        
        {level.level < 7 && (
          <div className="w-full h-2 bg-amber-900/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
              style={{ width: `${level.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-amber-950/30 rounded-lg p-3">
          <p className="text-xl font-bold text-amber-100">{level.divinationCount}</p>
          <p className="text-xs text-amber-400/60">占卜次数</p>
        </div>
        <div className="bg-amber-950/30 rounded-lg p-3">
          <p className="text-xl font-bold text-amber-100">{level.signInDays}</p>
          <p className="text-xs text-amber-400/60">签到天数</p>
        </div>
        <div className="bg-amber-950/30 rounded-lg p-3">
          <p className="text-xl font-bold text-amber-100">{signIn.continuousDays}</p>
          <p className="text-xs text-amber-400/60">连续签到</p>
        </div>
      </div>
    </div>
  );
}
