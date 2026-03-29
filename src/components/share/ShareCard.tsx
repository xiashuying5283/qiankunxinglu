'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

// 分享卡片类型
export type ShareCardType = 'iching' | 'tarot' | 'fortune-stick' | 'daily-fortune' | 'bazi';

// 周易分享数据
export interface IChingShareData {
  type: 'iching';
  hexagramSymbol: string;
  hexagramName: string;
  hexagramNumber: number;
  changedHexagramSymbol?: string;
  changedHexagramName?: string;
  judgement?: string;
  summary?: string;
}

// 塔罗分享数据
export interface TarotShareData {
  type: 'tarot';
  spreadName: string;
  cards: Array<{
    name: string;
    position: string;
    isReversed: boolean;
    keywords?: string[];
  }>;
  summary?: string;
}

// 求签分享数据
export interface FortuneStickShareData {
  type: 'fortune-stick';
  stickNumber: number;
  level: string;
  poem: string[];
  interpretation?: string;
}

// 每日运势分享数据
export interface DailyFortuneShareData {
  type: 'daily-fortune';
  zodiac: string;
  overall: string;
  love?: string;
  career?: string;
  wealth?: string;
  luckyColor?: string;
}

// 八字分享数据
export interface BaziShareData {
  type: 'bazi';
  summary: string;
  elements?: string[];
  personality?: string;
}

export type ShareData = IChingShareData | TarotShareData | FortuneStickShareData | DailyFortuneShareData | BaziShareData;

interface ShareCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ShareData;
  userName?: string;
}

// 获取网站域名
const getDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://divination.coze.site';
};

export function ShareCard({ open, onOpenChange, data, userName }: ShareCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const cardRef = useRef<HTMLDivElement>(null);

  // 生成二维码
  useEffect(() => {
    if (open) {
      QRCode.toDataURL(getDomain(), {
        width: 80,
        margin: 1,
        color: {
          dark: '#d4af37',
          light: '#00000000',
        },
      }).then(setQrCodeUrl);
    }
  }, [open]);

  // 生成图片
  const generateImage = useCallback(async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      
      const url = canvas.toDataURL('image/png');
      setImageUrl(url);
    } catch (error) {
      console.error('生成图片失败:', error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // 对话框打开时生成图片
  useEffect(() => {
    if (open && qrCodeUrl) {
      setImageUrl(null);
      setTimeout(generateImage, 100);
    }
  }, [open, qrCodeUrl, generateImage]);

  // 下载图片
  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.download = `占卜结果_${new Date().toLocaleDateString('zh-CN')}.png`;
    link.href = imageUrl;
    link.click();
  };

  // 分享图片
  const handleShare = async () => {
    if (!imageUrl) return;
    
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], '占卜结果.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: '我的占卜结果',
          text: '来看看我的占卜结果吧！',
          files: [file],
        });
      } else {
        // 不支持分享，则下载
        handleDownload();
      }
    } catch (error) {
      console.error('分享失败:', error);
      handleDownload();
    }
  };

  // 获取标题
  const getTitle = () => {
    switch (data.type) {
      case 'iching':
        return `${data.hexagramName}卦 · 周易占卜`;
      case 'tarot':
        return `${data.spreadName} · 塔罗占卜`;
      case 'fortune-stick':
        return `第${data.stickNumber}签 · 观音灵签`;
      case 'daily-fortune':
        return `${data.zodiac}今日运势`;
      case 'bazi':
        return '八字命盘解读';
      default:
        return '占卜结果';
    }
  };

  // 获取主题色
  const getThemeColors = () => {
    switch (data.type) {
      case 'iching':
        return { primary: '#d4af37', bg: 'from-amber-900 to-orange-900', accent: 'text-amber-400' };
      case 'tarot':
        return { primary: '#a855f7', bg: 'from-purple-900 to-indigo-900', accent: 'text-purple-400' };
      case 'fortune-stick':
        return { primary: '#f59e0b', bg: 'from-amber-800 to-yellow-800', accent: 'text-amber-300' };
      case 'daily-fortune':
        return { primary: '#3b82f6', bg: 'from-blue-900 to-cyan-900', accent: 'text-blue-400' };
      case 'bazi':
        return { primary: '#10b981', bg: 'from-emerald-900 to-teal-900', accent: 'text-emerald-400' };
      default:
        return { primary: '#d4af37', bg: 'from-amber-900 to-orange-900', accent: 'text-amber-400' };
    }
  };

  const theme = getThemeColors();
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            分享占卜结果
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 隐藏的卡片用于生成图片 */}
          <div className="absolute -left-[9999px] top-0">
            <div
              ref={cardRef}
              className="w-[375px] p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              {/* 装饰边框 */}
              <div 
                className="absolute inset-2 rounded-xl pointer-events-none"
                style={{ 
                  border: `1px solid ${theme.primary}30`,
                  background: `radial-gradient(circle at 50% 0%, ${theme.primary}10 0%, transparent 50%)`,
                }}
              />
              
              {/* 顶部装饰 */}
              <div className="text-center mb-4 relative">
                <div 
                  className="inline-block px-4 py-1 rounded-full text-sm mb-2"
                  style={{ background: `${theme.primary}20`, color: theme.primary }}
                >
                  ✨ 易学占卜
                </div>
                <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
                <p className="text-slate-400 text-sm mt-1">{today}</p>
              </div>

              {/* 内容区域 - 根据类型渲染 */}
              {data.type === 'iching' && (
                <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl mb-1">{data.hexagramSymbol}</div>
                      <div className="text-white font-bold">{data.hexagramName}卦</div>
                      <div className="text-slate-400 text-xs">第{data.hexagramNumber}卦</div>
                    </div>
                    {data.changedHexagramSymbol && (
                      <>
                        <div className="text-2xl" style={{ color: theme.primary }}>→</div>
                        <div className="text-center">
                          <div className="text-5xl mb-1">{data.changedHexagramSymbol}</div>
                          <div className="text-white font-bold">{data.changedHexagramName}卦</div>
                          <div className="text-slate-400 text-xs">变卦</div>
                        </div>
                      </>
                    )}
                  </div>
                  {data.judgement && (
                    <p className="text-slate-300 text-sm mt-4 text-center leading-relaxed">
                      "{data.judgement.slice(0, 60)}{data.judgement.length > 60 ? '...' : ''}"
                    </p>
                  )}
                </div>
              )}

              {data.type === 'tarot' && (
                <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                  <div className="space-y-3">
                    {data.cards.slice(0, 3).map((card, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                          style={{ background: `${theme.primary}30`, color: theme.primary }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium flex items-center gap-2">
                            {card.name}
                            {card.isReversed && <span className="text-xs text-red-400">逆位</span>}
                          </div>
                          <div className="text-slate-400 text-xs">{card.position}</div>
                        </div>
                      </div>
                    ))}
                    {data.cards.length > 3 && (
                      <div className="text-slate-400 text-xs text-center">
                        还有 {data.cards.length - 3} 张牌...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {data.type === 'fortune-stick' && (
                <div className="bg-slate-800/50 rounded-xl p-4 mb-4 text-center">
                  <div 
                    className="inline-block px-3 py-1 rounded-full text-sm mb-3"
                    style={{ background: data.level === '上签' ? '#22c55e20' : data.level === '下签' ? '#ef444420' : '#f59e0b20', color: data.level === '上签' ? '#22c55e' : data.level === '下签' ? '#ef4444' : '#f59e0b' }}
                  >
                    {data.level}
                  </div>
                  <div className="text-3xl font-bold text-white mb-3">第 {data.stickNumber} 签</div>
                  <div className="space-y-1">
                    {data.poem.slice(0, 4).map((line, i) => (
                      <p key={i} className="text-slate-300 text-sm">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {data.type === 'daily-fortune' && (
                <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-white">{data.zodiac}</span>
                    {data.luckyColor && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">幸运色</span>
                        <div className="w-6 h-6 rounded-full" style={{ background: data.luckyColor }} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">综合运势</span>
                      <span className="text-white">{data.overall}</span>
                    </div>
                    {data.love && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">爱情运</span>
                        <span className="text-pink-400">{data.love}</span>
                      </div>
                    )}
                    {data.career && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">事业运</span>
                        <span className="text-blue-400">{data.career}</span>
                      </div>
                    )}
                    {data.wealth && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">财运</span>
                        <span className="text-amber-400">{data.wealth}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {data.type === 'bazi' && (
                <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                  <p className="text-slate-300 text-sm leading-relaxed">{data.summary}</p>
                  {data.elements && (
                    <div className="flex gap-2 mt-3 justify-center flex-wrap">
                      {data.elements.map((el, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-slate-700 text-white text-xs">{el}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 底部信息 */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="二维码" className="w-12 h-12 rounded" />
                  )}
                  <div className="text-xs text-slate-400">
                    <p>扫码体验</p>
                    <p style={{ color: theme.primary }}>易学占卜</p>
                  </div>
                </div>
                {userName && (
                  <div className="text-xs text-slate-500">
                    {userName} 的占卜
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 预览图片 */}
          {isGenerating ? (
            <div className="aspect-[4/5] bg-slate-800 rounded-lg flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : imageUrl ? (
            <div className="aspect-[4/5] bg-slate-800 rounded-lg overflow-hidden">
              <img src={imageUrl} alt="分享图" className="w-full h-full object-contain" />
            </div>
          ) : null}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!imageUrl || isGenerating}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Download className="w-4 h-4 mr-2" />
              保存图片
            </Button>
            <Button
              onClick={handleShare}
              disabled={!imageUrl || isGenerating}
              className="flex-1"
              style={{ background: theme.primary, color: '#000' }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            图片已生成，可保存到相册或直接分享给好友
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
