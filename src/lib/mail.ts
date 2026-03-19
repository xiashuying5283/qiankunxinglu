/**
 * 邮件发送服务
 * 使用 Resend 邮件服务发送邮件
 */

// 获取邮件服务配置
function getMailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.MAIL_FROM || 'onboarding@resend.dev',
  };
}

// 检查邮件服务是否已配置
export function isMailConfigured(): boolean {
  const config = getMailConfig();
  return !!config.apiKey;
}

// 邮件发送参数
interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// 发送邮件
export async function sendMail(params: SendMailParams): Promise<{ success: boolean; error?: string }> {
  const config = getMailConfig();

  if (!config.apiKey) {
    console.error('RESEND_API_KEY is not configured');
    return { success: false, error: '邮件服务未配置' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send email:', error);
      return { success: false, error: '邮件发送失败' };
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: '邮件发送失败' };
  }
}

// 发送密码重置邮件
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  const subject = '重置您的密码 - 易经占卜';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>重置密码</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🔮 易经占卜</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">重置您的密码</h2>
        <p style="color: #666;">您好，</p>
        <p style="color: #666;">我们收到了重置您账户密码的请求。请点击下方按钮重置密码：</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">重置密码</a>
        </div>
        <p style="color: #666; font-size: 14px;">或者复制以下链接到浏览器：</p>
        <p style="color: #764ba2; word-break: break-all; font-size: 14px; background: #fff; padding: 10px; border-radius: 5px;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">此链接将在 1 小时后失效。如果您没有请求重置密码，请忽略此邮件。</p>
        <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    </body>
    </html>
  `;

  return sendMail({ to: email, subject, html });
}
