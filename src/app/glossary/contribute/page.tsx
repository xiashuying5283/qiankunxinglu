'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Plus, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  ExternalLink,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Reference {
  title: string;
  author: string;
  publisher: string;
  year: string;
  url: string;
}

interface Contribution {
  id: number;
  term: string;
  category: string;
  status: string;
  createdAt: string;
  reviewNote?: string;
}

function ContributePageContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // 表单数据
  const [term, setTerm] = useState(searchParams.get('term') || '');
  const [category, setCategory] = useState('iching');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [origin, setOrigin] = useState('');
  const [examples, setExamples] = useState<string[]>(['']);
  const [relatedTerms, setRelatedTerms] = useState<string[]>(['']);
  const [references, setReferences] = useState<Reference[]>([{ title: '', author: '', publisher: '', year: '', url: '' }]);
  
  // 我的贡献
  const [myContributions, setMyContributions] = useState<Contribution[]>([]);
  
  useEffect(() => {
    if (user) {
      fetchMyContributions();
    }
  }, [user]);
  
  const fetchMyContributions = async () => {
    try {
      const response = await fetch(`/api/glossary/contributions?user_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setMyContributions(data.slice(0, 10)); // 只显示最近10条
      }
    } catch (e) {
      console.error('获取贡献记录失败:', e);
    }
  };
  
  const addExample = () => setExamples([...examples, '']);
  const removeExample = (index: number) => setExamples(examples.filter((_, i) => i !== index));
  const updateExample = (index: number, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
  };
  
  const addRelatedTerm = () => setRelatedTerms([...relatedTerms, '']);
  const removeRelatedTerm = (index: number) => setRelatedTerms(relatedTerms.filter((_, i) => i !== index));
  const updateRelatedTerm = (index: number, value: string) => {
    const newTerms = [...relatedTerms];
    newTerms[index] = value;
    setRelatedTerms(newTerms);
  };
  
  const addReference = () => setReferences([...references, { title: '', author: '', publisher: '', year: '', url: '' }]);
  const removeReference = (index: number) => setReferences(references.filter((_, i) => i !== index));
  const updateReference = (index: number, field: keyof Reference, value: string) => {
    const newRefs = [...references];
    newRefs[index] = { ...newRefs[index], [field]: value };
    setReferences(newRefs);
  };
  
  const handleSubmit = async () => {
    // 验证必填字段
    if (!term.trim()) {
      setError('请填写词条名称');
      return;
    }
    if (!shortDesc.trim()) {
      setError('请填写简短描述');
      return;
    }
    if (!fullDesc.trim()) {
      setError('请填写详细描述');
      return;
    }
    
    // 检查参考文献
    const validRefs = references.filter(r => r.title.trim());
    if (validRefs.length === 0) {
      setError('请至少添加一条参考文献');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const response = await fetch('/api/glossary/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: term.trim(),
          category,
          short_desc: shortDesc.trim(),
          full_desc: fullDesc.trim(),
          origin: origin.trim() || null,
          examples: examples.filter(e => e.trim()),
          related_terms: relatedTerms.filter(t => t.trim()),
          references: validRefs,
          contribution_type: 'add',
          user_id: user?.id || null,
          user_name: user?.name || user?.email || null,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        // 重置表单
        setTerm('');
        setShortDesc('');
        setFullDesc('');
        setOrigin('');
        setExamples(['']);
        setRelatedTerms(['']);
        setReferences([{ title: '', author: '', publisher: '', year: '', url: '' }]);
        fetchMyContributions();
        // 滚动到顶部显示成功消息
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.error || data.details || '提交失败，请稍后重试');
      }
    } catch (e) {
      console.error('Submit error:', e);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">审核中</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">已通过</Badge>;
      case 'rejected':
        return <Badge variant="destructive">已拒绝</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/glossary">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回词典
            </Button>
          </Link>
        </div>
        
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary mb-2">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-3xl font-bold">贡献词条</h1>
          </div>
          <p className="text-muted-foreground">
            帮助完善科普词典，让更多人了解传统文化
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* 左侧：贡献指南 */}
          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  贡献指南
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-1">词条要求</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>内容准确，来源可靠</li>
                    <li>表述通俗易懂</li>
                    <li>引用经典文献原文</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">参考文献</h4>
                  <p className="text-muted-foreground">
                    请引用权威出版物，如中华书局、上海古籍出版社等版本。
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">审核流程</h4>
                  <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                    <li>提交贡献</li>
                    <li>等待审核</li>
                    <li>通过后发布</li>
                  </ol>
                </div>
                
                <Separator />
                
                <div className="text-muted-foreground">
                  <p>推荐参考文献：</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <p>• 《周易正义》中华书局</p>
                    <p>• 《渊海子平》中州古籍出版社</p>
                    <p>• 《三命通会》中医古籍出版社</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 右侧：表单 */}
          <div className="md:col-span-2 space-y-6">
            {success && (
              <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span>提交成功！感谢您的贡献，我们会尽快审核。</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {error && (
              <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>词条信息</CardTitle>
                <CardDescription>
                  填写词条的基本信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 词条名称 */}
                <div>
                  <Label htmlFor="term">词条名称 <span className="text-red-500">*</span></Label>
                  <Input
                    id="term"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="如：卦、爻、天干"
                  />
                </div>
                
                {/* 分类 */}
                <div>
                  <Label htmlFor="category">分类 <span className="text-red-500">*</span></Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iching">周易</SelectItem>
                      <SelectItem value="bazi">八字</SelectItem>
                      <SelectItem value="general">通用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 简短描述 */}
                <div>
                  <Label htmlFor="shortDesc">简短描述 <span className="text-red-500">*</span></Label>
                  <Input
                    id="shortDesc"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="一句话概括词条含义"
                  />
                </div>
                
                {/* 详细描述 */}
                <div>
                  <Label htmlFor="fullDesc">详细描述 <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="fullDesc"
                    value={fullDesc}
                    onChange={(e) => setFullDesc(e.target.value)}
                    placeholder="详细解释词条的含义、作用、应用场景等"
                    rows={6}
                  />
                </div>
                
                {/* 出处 */}
                <div>
                  <Label htmlFor="origin">出处</Label>
                  <Textarea
                    id="origin"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="经典文献中的原文引用"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>示例</CardTitle>
                <CardDescription>
                  添加词条的使用示例
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {examples.map((example, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={example}
                      onChange={(e) => updateExample(index, e.target.value)}
                      placeholder="示例说明"
                      className="flex-1"
                    />
                    {examples.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExample(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addExample}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加示例
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>相关词条</CardTitle>
                <CardDescription>
                  添加与此词条相关的其他词条
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedTerms.map((term, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={term}
                      onChange={(e) => updateRelatedTerm(index, e.target.value)}
                      placeholder="相关词条名称"
                      className="flex-1"
                    />
                    {relatedTerms.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRelatedTerm(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addRelatedTerm}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加相关词条
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  参考文献 <span className="text-red-500">*</span>
                </CardTitle>
                <CardDescription>
                  引用权威文献，提升词条可信度
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {references.map((ref, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">文献 {index + 1}</span>
                      {references.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReference(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">书名 <span className="text-red-500">*</span></Label>
                        <Input
                          value={ref.title}
                          onChange={(e) => updateReference(index, 'title', e.target.value)}
                          placeholder="如：周易正义"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">作者</Label>
                        <Input
                          value={ref.author}
                          onChange={(e) => updateReference(index, 'author', e.target.value)}
                          placeholder="如：王弼 注"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">出版社</Label>
                        <Input
                          value={ref.publisher}
                          onChange={(e) => updateReference(index, 'publisher', e.target.value)}
                          placeholder="如：中华书局"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">年份</Label>
                        <Input
                          value={ref.year}
                          onChange={(e) => updateReference(index, 'year', e.target.value)}
                          placeholder="如：1980"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">参考链接（可选）</Label>
                      <Input
                        value={ref.url}
                        onChange={(e) => updateReference(index, 'url', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addReference}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加参考文献
                </Button>
              </CardContent>
            </Card>
            
            {/* 提交按钮 */}
            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  '提交贡献'
                )}
              </Button>
            </div>
            
            {/* 我的贡献 */}
            {myContributions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">我的贡献</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myContributions.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{c.term}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {getStatusBadge(c.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContributePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ContributePageContent />
    </Suspense>
  );
}
