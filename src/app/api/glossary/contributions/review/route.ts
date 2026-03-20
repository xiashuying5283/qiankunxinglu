import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 审核用户贡献
 * POST /api/glossary/contributions/review
 * 
 * Body:
 * - id: 贡献ID
 * - action: 操作 (approve, reject)
 * - reviewer_id: 审核人ID
 * - review_note: 审核备注
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, action, reviewer_id, review_note } = body;
    
    if (!id || !action || !reviewer_id) {
      return NextResponse.json({
        error: '缺少必填字段'
      }, { status: 400 });
    }
    
    const client = getSupabaseClient();
    
    // 获取贡献记录
    const { data: contribution, error: fetchError } = await client
      .from('glossary_contributions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !contribution) {
      return NextResponse.json({
        error: '贡献记录不存在'
      }, { status: 404 });
    }
    
    if (contribution.status !== 'pending') {
      return NextResponse.json({
        error: '该贡献已被审核'
      }, { status: 400 });
    }
    
    if (action === 'approve') {
      // 批准：将贡献内容添加到主词条表
      if (contribution.contribution_type === 'add') {
        // 新增词条
        const { error: insertError } = await client
          .from('glossary')
          .insert({
            term: contribution.term,
            category: contribution.category,
            short_desc: contribution.short_desc,
            full_desc: contribution.full_desc,
            origin: contribution.origin,
            examples: contribution.examples,
            related_terms: contribution.related_terms,
            refs: contribution.refs,  // 数据库字段名为 refs
          });
        
        if (insertError) {
          throw insertError;
        }
      } else if (contribution.contribution_type === 'edit' || contribution.contribution_type === 'improve') {
        // 编辑词条
        const { error: updateError } = await client
          .from('glossary')
          .update({
            short_desc: contribution.short_desc,
            full_desc: contribution.full_desc,
            origin: contribution.origin,
            examples: contribution.examples,
            related_terms: contribution.related_terms,
            refs: contribution.refs,  // 数据库字段名为 refs
            updated_at: new Date().toISOString(),
          })
          .eq('id', contribution.original_term_id);
        
        if (updateError) {
          throw updateError;
        }
      }
      
      // 更新贡献状态为已批准
      await client
        .from('glossary_contributions')
        .update({
          status: 'approved',
          reviewer_id,
          review_note,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      return NextResponse.json({
        message: '审核通过，词条已更新'
      });
      
    } else if (action === 'reject') {
      // 拒绝
      await client
        .from('glossary_contributions')
        .update({
          status: 'rejected',
          reviewer_id,
          review_note,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      return NextResponse.json({
        message: '已拒绝该贡献'
      });
    } else {
      return NextResponse.json({
        error: '无效的操作类型'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('审核失败:', error);
    return NextResponse.json({
      error: '审核失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
