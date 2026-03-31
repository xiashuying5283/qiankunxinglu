'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface DisclaimerProps {
  variant?: 'full' | 'compact' | 'footer';
}

// ICP 备案号
const ICP_BEIAN = '京ICP备2026015184号';

/**
 * 免责声明组件
 * - full: 完整版，用于占卜页面底部
 * - compact: 精简版，用于弹窗或卡片内
 * - footer: 页脚版，用于网站底部
 */
export function Disclaimer({ variant = 'full' }: DisclaimerProps) {
  // 公安备案号（从环境变量读取，可选）
  const gonganBeian = process.env.NEXT_PUBLIC_GONGAN_BEIAN;
  
  if (variant === 'footer') {
    return (
      <div className="text-center text-gray-400 text-xs py-4 px-4 border-t border-white/10">
        <p className="mb-2">
          本网站所有内容均为传统民俗文化科普与娱乐参考，不构成任何人生决策依据
        </p>
        <p className="mb-2">
          不涉及封建迷信宣传与相关承诺 · 
          <Link href="/privacy" className="text-purple-300 hover:text-purple-200 ml-1">
            隐私政策
          </Link>
        </p>
        <p className="text-gray-500 space-x-3">
          <a 
            href="https://beian.miit.gov.cn/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors"
          >
            {ICP_BEIAN}
          </a>
          {gonganBeian && (
            <a 
              href={`https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=${gonganBeian.replace(/[^0-9]/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-400 transition-colors inline-flex items-center gap-1"
            >
              {gonganBeian}
            </a>
          )}
        </p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-2 text-xs text-gray-400 bg-white/5 rounded-lg p-3">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>本内容为传统民俗文化科普与娱乐参考，不构成任何人生决策依据。</p>
      </div>
    );
  }

  // full variant
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mt-6 border border-white/10">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300 space-y-2">
          <p className="font-medium text-amber-200">免责声明</p>
          <ul className="space-y-1 text-xs text-gray-400">
            <li>• 本网站所有内容均为传统民俗文化科普与娱乐参考，不构成任何人生决策依据</li>
            <li>• 不涉及封建迷信宣传与相关承诺，不保证结果的准确性与实际效果</li>
            <li>• 用户应理性看待占卜结果，重大人生决策请咨询专业人士</li>
            <li>• 使用本服务即表示您已阅读并同意
              <Link href="/privacy" className="text-purple-300 hover:text-purple-200 ml-1">
                《隐私政策》
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
