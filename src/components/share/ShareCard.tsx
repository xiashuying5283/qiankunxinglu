'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2 } from 'lucide-react';
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
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000';
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
      }).then(setQrCodeUrl).catch(console.error);
    }
  }, [open]);

  // 生成图片
  const generateImage = useCallback(async () => {
    if (!cardRef.current) {
      console.error('cardRef is null');
      return;
    }
    
    setIsGenerating(true);
    console.log('开始生成图片...');
    
    try {
      // 等待一帧确保 DOM 渲染完成
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
        useCORS: true,
        allowTaint: true,
        logging: true,
      });
      
      console.log('Canvas 生成成功', canvas.width, canvas.height);
      const url = canvas.toDataURL('image/png');
      console.log('图片 URL 生成成功');
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
      // 延迟生成，确保 DOM 完全渲染
      const timer = setTimeout(generateImage, 300);
      return () => clearTimeout(timer);
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
        return { primary: '#d4af37', accent: '#d4af37' };
      case 'tarot':
        return { primary: '#a855f7', accent: '#a855f7' };
      case 'fortune-stick':
        return { primary: '#f59e0b', accent: '#f59e0b' };
      case 'daily-fortune':
        return { primary: '#3b82f6', accent: '#3b82f6' };
      case 'bazi':
        return { primary: '#10b981', accent: '#10b981' };
      default:
        return { primary: '#d4af37', accent: '#d4af37' };
    }
  };

  const theme = getThemeColors();
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  // 渲染卡片内容
  const renderCardContent = () => {
    switch (data.type) {
      case 'iching':
        return (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '4px' }}>{data.hexagramSymbol}</div>
                <div style={{ color: 'white', fontWeight: 'bold' }}>{data.hexagramName}卦</div>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>第{data.hexagramNumber}卦</div>
              </div>
              {data.changedHexagramSymbol && (
                <>
                  <div style={{ fontSize: '24px', color: theme.primary }}>→</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '4px' }}>{data.changedHexagramSymbol}</div>
                    <div style={{ color: 'white', fontWeight: 'bold' }}>{data.changedHexagramName}卦</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>变卦</div>
                  </div>
                </>
              )}
            </div>
            {data.judgement && (
              <p style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '16px', textAlign: 'center', lineHeight: '1.6' }}>
                "{data.judgement.slice(0, 60)}{data.judgement.length > 60 ? '...' : ''}"
              </p>
            )}
          </div>
        );

      case 'tarot':
        return (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.cards.slice(0, 3).map((card, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    background: `${theme.primary}30`,
                    color: theme.primary
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {card.name}
                      {card.isReversed && <span style={{ fontSize: '12px', color: '#f87171' }}>逆位</span>}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>{card.position}</div>
                  </div>
                </div>
              ))}
              {data.cards.length > 3 && (
                <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
                  还有 {data.cards.length - 3} 张牌...
                </div>
              )}
            </div>
          </div>
        );

      case 'fortune-stick':
        return (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ 
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '14px',
              marginBottom: '12px',
              background: data.level.includes('上') ? 'rgba(34, 197, 94, 0.2)' : data.level.includes('下') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: data.level.includes('上') ? '#22c55e' : data.level.includes('下') ? '#ef4444' : '#f59e0b'
            }}>
              {data.level}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>第 {data.stickNumber} 签</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {data.poem.slice(0, 4).map((line, i) => (
                <p key={i} style={{ color: '#cbd5e1', fontSize: '14px' }}>{line}</p>
              ))}
            </div>
          </div>
        );

      case 'daily-fortune':
        return (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{data.zodiac}</span>
              {data.luckyColor && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>幸运色</span>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: data.luckyColor }} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>综合运势</span>
                <span style={{ color: 'white' }}>{data.overall}</span>
              </div>
              {data.love && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>爱情运</span>
                  <span style={{ color: '#f472b6' }}>{data.love}</span>
                </div>
              )}
              {data.career && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>事业运</span>
                  <span style={{ color: '#60a5fa' }}>{data.career}</span>
                </div>
              )}
              {data.wealth && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>财运</span>
                  <span style={{ color: '#fbbf24' }}>{data.wealth}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'bazi':
        return (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>{data.summary}</p>
            {data.elements && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {data.elements.map((el, i) => (
                  <span key={i} style={{ padding: '4px 8px', borderRadius: '4px', background: '#334155', color: 'white', fontSize: '12px' }}>{el}</span>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

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
          {/* 用于生成图片的卡片 - 使用 visibility hidden 而不是 position */}
          <div 
            style={{ 
              position: 'fixed',
              left: '0',
              top: '0',
              zIndex: -9999,
              opacity: 0,
              pointerEvents: 'none',
            }}
          >
            <div
              ref={cardRef}
              style={{
                width: '375px',
                padding: '24px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                borderRadius: '16px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {/* 顶部装饰 */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ 
                  display: 'inline-block',
                  padding: '4px 16px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  marginBottom: '8px',
                  background: `${theme.primary}20`,
                  color: theme.primary
                }}>
                  ✨ 易学占卜
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{getTitle()}</h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>{today}</p>
              </div>

              {/* 内容区域 */}
              {renderCardContent()}

              {/* 底部信息 */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="二维码" style={{ width: '48px', height: '48px', borderRadius: '4px' }} />
                  )}
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    <p>扫码体验</p>
                    <p style={{ color: theme.primary }}>易学占卜</p>
                  </div>
                </div>
                {userName && (
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {userName} 的占卜
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 预览图片 */}
          {isGenerating ? (
            <div className="aspect-[4/5] bg-slate-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">正在生成图片...</p>
              </div>
            </div>
          ) : imageUrl ? (
            <div className="aspect-[4/5] bg-slate-800 rounded-lg overflow-hidden">
              <img src={imageUrl} alt="分享图" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="aspect-[4/5] bg-slate-800 rounded-lg flex items-center justify-center">
              <p className="text-slate-400">准备生成...</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!imageUrl || isGenerating}
              className="flex-1 border-slate-500 bg-slate-800 text-slate-50 hover:bg-slate-700 hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              保存图片
            </Button>
            <Button
              onClick={handleShare}
              disabled={!imageUrl || isGenerating}
              className="flex-1"
              style={{ background: theme.primary, color: '#0f172a', fontWeight: 600 }}
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
