import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取用户贡献列表
 * GET /api/glossary/contributions
 * 
 * Query params:
 * - status: 状态筛选 (pending, approved, rejected)
 * - user_id: 用户ID筛选
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('user_id');
    
    const client = getSupabaseClient();
    
    let query = client
      .from('glossary_contributions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      // 表可能不存在，返回空数组
      const errorMsg = error.message || '';
      if (error.code === '42P01' || 
          errorMsg.includes('does not exist') || 
          errorMsg.includes('Could not find the table')) {
        return NextResponse.json([]);
      }
      throw error;
    }
    
    // 转换字段名
    const result = (data || []).map(item => ({
      id: item.id,
      term: item.term,
      category: item.category,
      shortDesc: item.short_desc,
      fullDesc: item.full_desc,
      origin: item.origin,
      examples: item.examples,
      relatedTerms: item.related_terms,
      references: item.refs || [],  // 数据库字段名为 refs
      contributionType: item.contribution_type,
      originalTermId: item.original_term_id,
      userId: item.user_id,
      userName: item.user_name,
      status: item.status,
      reviewerId: item.reviewer_id,
      reviewNote: item.review_note,
      reviewedAt: item.reviewed_at,
      createdAt: item.created_at,
    }));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('获取贡献列表失败:', error);
    // 表不存在时返回空数组
    if (error instanceof Error && error.message.includes('does not exist')) {
      return NextResponse.json([]);
    }
    return NextResponse.json({ 
      error: '获取失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * 提交用户贡献
 * POST /api/glossary/contributions
 * 
 * Body:
 * - term: 词条名称
 * - category: 分类
 * - short_desc: 简短描述
 * - full_desc: 详细描述
 * - origin: 出处
 * - examples: 示例数组
 * - related_terms: 相关词条数组
 * - references: 参考文献数组
 * - contribution_type: 贡献类型 (add, edit, improve)
 * - original_term_id: 原词条ID (编辑时必填)
 * - user_id: 用户ID
 * - user_name: 用户名
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();
    
    const {
      term,
      category,
      short_desc,
      full_desc,
      origin,
      examples = [],
      related_terms = [],
      references = [],
      contribution_type = 'add',
      original_term_id,
      user_id,
      user_name,
    } = body;
    
    // 验证必填字段
    if (!term || !category || !short_desc || !full_desc) {
      return NextResponse.json({
        error: '缺少必填字段：词条名称、分类、简短描述和详细描述为必填项'
      }, { status: 400 });
    }
    
    // 插入贡献记录
    const { data, error } = await client
      .from('glossary_contributions')
      .insert({
        term,
        category,
        short_desc,
        full_desc,
        origin: origin || null,
        examples: examples || [],
        related_terms: related_terms || [],
        refs: references || [],  // 数据库字段名为 refs
        contribution_type: contribution_type || 'add',
        original_term_id: original_term_id || null,
        user_id: user_id || null,
        user_name: user_name || null,
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({
        error: '数据库操作失败',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      message: '提交成功，等待审核',
      id: data.id
    });
  } catch (error) {
    console.error('提交贡献失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({
      error: '提交失败',
      details: errorMessage
    }, { status: 500 });
  }
}
