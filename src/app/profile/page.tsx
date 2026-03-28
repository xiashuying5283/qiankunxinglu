'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame, GameStatsPanel } from '@/components/game';
import { SignInRecords } from '@/components/game/SignInRecords';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, Mail, Coins, Star, TrendingUp, Calendar, Award, 
  CheckCircle2, Lock, Crown, Sparkles, ArrowLeft, History,
  Camera, Save, X, Edit2, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 完整的等级配置
const LEVEL_SYSTEM = [
  { 
    level: 1, 
    name: '入门弟子', 
    minExp: 0, 
    maxExp: 100,
    privilege: '基础占卜功能',
    icon: '🌱',
    color: 'from-green-500 to-emerald-500',
    description: '初入易学之门，开始探索古老的智慧'
  },
  { 
    level: 2, 
    name: '六爻学徒', 
    minExp: 100, 
    maxExp: 300,
    privilege: '每日额外1次免费占卜',
    icon: '📖',
    color: 'from-blue-500 to-cyan-500',
    description: '研习六爻之术，渐入佳境'
  },
  { 
    level: 3, 
    name: '周易卦师', 
    minExp: 300, 
    maxExp: 600,
    privilege: '每日额外2次免费占卜',
    icon: '🎯',
    color: 'from-blue-500 to-indigo-500',
    description: '精通周易卦象，洞察天机'
  },
  { 
    level: 4, 
    name: '精通大师', 
    minExp: 600, 
    maxExp: 1000,
    privilege: '解锁专属解卦模板',
    icon: '⭐',
    color: 'from-amber-500 to-orange-500',
    description: '融会贯通，技艺精湛'
  },
  { 
    level: 5, 
    name: '一代宗师', 
    minExp: 1000, 
    maxExp: 2000,
    privilege: '免费高级详批每月1次',
    icon: '👑',
    color: 'from-amber-500 to-yellow-500',
    description: '开宗立派，传道授业'
  },
  { 
    level: 6, 
    name: '玄学泰斗', 
    minExp: 2000, 
    maxExp: 5000,
    privilege: '所有功能免费无限使用',
    icon: '🌟',
    color: 'from-purple-500 to-pink-500',
    description: '名震江湖，威望极高'
  },
  { 
    level: 7, 
    name: '天人合一', 
    minExp: 5000, 
    maxExp: Infinity,
    privilege: '专属称号与标识',
    icon: '🌈',
    color: 'from-pink-500 to-rose-500',
    description: '达到最高境界，与道合一'
  },
];

// 提供商显示名称
const providerNames: Record<string, string> = {
  google: 'Google',
  github: 'GitHub',
};

export default function ProfilePage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const { gameState, loading: gameLoading, showSignIn } = useGame();
  const router = useRouter();

  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // 文件上传相关
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 初始化编辑表单
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditAvatar(user.avatar || '');
    }
  }, [user]);

  // 如果未登录，显示登录提示
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md">
          <CardContent className="pt-6 text-center">
            <User className="w-16 h-16 mx-auto text-slate-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">请先登录</h2>
            <p className="text-slate-400 mb-6">登录后可查看您的修行进度</p>
            <Link href="/">
              <Button className="bg-amber-600 hover:bg-amber-500">
                返回首页
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentLevel = gameState?.level.level || 1;
  const currentExp = gameState?.level.totalExperience || 0;

  // 处理头像文件上传
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setSaveError('请选择图片文件');
      return;
    }

    // 验证文件大小（最大 2MB）
    if (file.size > 2 * 1024 * 1024) {
      setSaveError('图片大小不能超过 2MB');
      return;
    }

    setIsUploading(true);
    setSaveError('');

    try {
      // 转换为 Base64 Data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setEditAvatar(dataUrl);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setSaveError('读取图片失败');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      setSaveError('上传失败，请稍后重试');
      setIsUploading(false);
    }
  };

  // 保存编辑
  const handleSave = async () => {
    if (!editName.trim()) {
      setSaveError('昵称不能为空');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          avatar: editAvatar || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveSuccess(true);
        setIsEditing(false);
        // 刷新用户信息
        await refreshUser();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(data.error || '保存失败');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveError('保存失败，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setEditName(user?.name || '');
    setEditAvatar(user?.avatar || '');
    setIsEditing(false);
    setSaveError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">我的修行</h1>
          <p className="text-slate-400">探索易学之路，步步精进</p>
        </div>

        {/* 成功提示 */}
        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-center">
            保存成功
          </div>
        )}

        {/* 用户基本信息 */}
        <Card className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-slate-600 mb-6">
          <CardContent className="pt-6">
            {isEditing ? (
              // 编辑模式
              <div className="space-y-6">
                {/* 头像编辑 */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {editAvatar ? (
                      <img
                        src={editAvatar}
                        alt="头像预览"
                        className="h-24 w-24 rounded-full object-cover ring-4 ring-amber-500/30"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-amber-500/20 flex items-center justify-center ring-4 ring-amber-500/30">
                        <User className="h-12 w-12 text-amber-500" />
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 p-2 bg-amber-500 rounded-full hover:bg-amber-400 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-slate-400">点击相机图标更换头像</p>
                </div>

                {/* 昵称编辑 */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">昵称</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="请输入昵称"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    maxLength={50}
                  />
                  <p className="text-xs text-slate-500">{editName.length}/50</p>
                </div>

                {/* 头像URL编辑（可选） */}
                <div className="space-y-2">
                  <Label htmlFor="avatar" className="text-slate-300">
                    头像链接 <span className="text-slate-500">(可选)</span>
                  </Label>
                  <Input
                    id="avatar"
                    value={editAvatar && !editAvatar.startsWith('data:') ? editAvatar : ''}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                  <p className="text-xs text-slate-500">可以直接粘贴图片链接，或使用上方按钮上传</p>
                </div>

                {/* 错误提示 */}
                {saveError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {saveError}
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    取消
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || isUploading}
                    className="bg-amber-600 hover:bg-amber-500"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        保存
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              // 显示模式
              <div className="flex items-center gap-6">
                {/* 头像 */}
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || '用户'}
                    className="h-20 w-20 rounded-full object-cover ring-4 ring-amber-500/30"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-amber-500/20 flex items-center justify-center ring-4 ring-amber-500/30">
                    <User className="h-10 w-10 text-amber-500" />
                  </div>
                )}
                
                {/* 用户信息 */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{user?.name || '用户'}</h2>
                    {gameState && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${LEVEL_SYSTEM[currentLevel - 1].color} text-white`}>
                        {LEVEL_SYSTEM[currentLevel - 1].icon} {gameState.level.title}
                      </span>
                    )}
                  </div>
                  
                  {user?.email && (
                    <p className="text-slate-400 flex items-center mb-1">
                      <Mail className="h-4 w-4 mr-2" />
                      {user.email}
                    </p>
                  )}
                  
                  {user?.provider && (
                    <p className="text-slate-500 text-sm">
                      {providerNames[user.provider] || user.provider} 账号
                    </p>
                  )}
                </div>

                {/* 编辑按钮 */}
                {!user?.isGuest && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    编辑资料
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 游戏统计面板 */}
        <div className="mb-6">
          <GameStatsPanel />
        </div>

        {/* 签到日历 */}
        <SignInRecords className="mb-8" />

        {/* 等级体系 */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              修行境界
            </CardTitle>
            <p className="text-slate-400 text-sm mt-1">
              从入门弟子到天人合一，探索易学智慧的成长之路
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {LEVEL_SYSTEM.map((levelInfo, index) => {
                const isCurrentLevel = levelInfo.level === currentLevel;
                const isUnlocked = levelInfo.level <= currentLevel;
                const isNextLevel = levelInfo.level === currentLevel + 1;
                
                return (
                  <div
                    key={levelInfo.level}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isCurrentLevel 
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 ring-2 ring-amber-500/20' 
                        : isUnlocked 
                        ? 'bg-slate-700/30 border-slate-600' 
                        : 'bg-slate-800/30 border-slate-700/50 opacity-60'
                    }`}
                  >
                    {/* 当前等级标记 */}
                    {isCurrentLevel && (
                      <div className="absolute -top-3 left-4 px-3 py-0.5 bg-amber-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        当前境界
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      {/* 等级图标 */}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                        isUnlocked 
                          ? `bg-gradient-to-br ${levelInfo.color}` 
                          : 'bg-slate-700'
                      }`}>
                        {isUnlocked ? levelInfo.icon : <Lock className="w-6 h-6 text-slate-500" />}
                      </div>
                      
                      {/* 等级信息 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`text-lg font-bold ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                            {levelInfo.name}
                          </h3>
                          <span className="text-sm text-slate-400">
                            Lv.{levelInfo.level}
                          </span>
                        </div>
                        
                        <p className="text-sm text-slate-400 mb-2">
                          {levelInfo.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-500">
                            经验：{levelInfo.minExp} - {levelInfo.maxExp === Infinity ? '∞' : levelInfo.maxExp}
                          </span>
                          <span className={`flex items-center gap-1 ${isUnlocked ? 'text-amber-400' : 'text-slate-500'}`}>
                            <Sparkles className="w-3 h-3" />
                            {levelInfo.privilege}
                          </span>
                        </div>
                        
                        {/* 当前进度条 */}
                        {isCurrentLevel && levelInfo.maxExp !== Infinity && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                              <span>当前经验：{currentExp}</span>
                              <span>下一级：{levelInfo.maxExp}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${levelInfo.color} transition-all duration-500`}
                                style={{ 
                                  width: `${Math.min(100, ((currentExp - levelInfo.minExp) / (levelInfo.maxExp - levelInfo.minExp)) * 100)}%` 
                                }}
                              />
                            </div>
                            <p className="text-xs text-amber-400 mt-1">
                              距离下一级还需 {levelInfo.maxExp - currentExp} 经验
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 连接线 */}
                    {index < LEVEL_SYSTEM.length - 1 && (
                      <div className="absolute left-11 bottom-0 w-0.5 h-4 -mb-4 bg-slate-700" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 获取经验方式 */}
        <Card className="bg-slate-800/50 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              如何获取经验
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <Calendar className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                <p className="text-white font-medium">每日签到</p>
                <p className="text-amber-400 text-lg font-bold">+10</p>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <Star className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-white font-medium">占卜</p>
                <p className="text-purple-400 text-lg font-bold">+5</p>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <Coins className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-white font-medium">阅读知识</p>
                <p className="text-blue-400 text-lg font-bold">+2</p>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <Sparkles className="w-8 h-8 mx-auto text-pink-500 mb-2" />
                <p className="text-white font-medium">分享</p>
                <p className="text-pink-400 text-lg font-bold">+20</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 快捷入口 */}
        <div className="mt-6 flex justify-center gap-4">
          <Button 
            onClick={showSignIn}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400"
          >
            <Calendar className="w-4 h-4 mr-2" />
            每日签到
          </Button>
          <Link href="/history">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <History className="w-4 h-4 mr-2" />
              历史记录
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
