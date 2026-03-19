import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隐私政策 - 占卜问卦',
  description: '占卜问卦隐私政策，了解我们如何收集、使用和保护您的个人信息。',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-8">隐私政策</h1>
        
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-gray-200 space-y-6">
          <p className="text-sm text-gray-400">更新日期：2025年1月</p>
          
          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-3">一、引言</h2>
            <p className="text-gray-300 leading-relaxed">
              欢迎使用占卜问卦网站（以下简称"本站"）。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。
              使用本站服务即表示您同意本隐私政策的条款。我们严格遵守《中华人民共和国个人信息保护法》等相关法律法规。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-3">二、信息收集</h2>
            <div className="space-y-3 text-gray-300">
              <p>我们可能收集以下类型的信息：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>账户信息</strong>：当您注册账户时，我们会收集您的邮箱地址、用户名等基本信息。</li>
                <li><strong>占卜相关数据</strong>：为了提供占卜服务，我们会收集您输入的出生日期、时间、问题内容等信息。这些信息仅用于生成占卜结果。</li>
                <li><strong>使用记录</strong>：我们会记录您的占卜历史、学习进度等，以便为您提供个性化服务。</li>
                <li><strong>设备信息</strong>：我们可能收集您的设备类型、浏览器类型等技术信息，用于优化网站性能。</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-3">三、信息使用</h2>
            <div className="space-y-3 text-gray-300">
              <p>我们收集的信息将用于：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>提供占卜服务并生成解读内容</li>
                <li>保存您的占卜历史记录，方便您查看回顾</li>
                <li>改善和优化网站功能与用户体验</li>
                <li>发送与您账户相关的重要通知</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-3">四、信息存储与保护</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                您的个人信息存储在安全的服务器上，我们采取合理的技术和管理措施保护您的信息安全，包括但不限于：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>数据传输加密（HTTPS）</li>
                <li>密码加密存储</li>
                <li>访问权限控制</li>
                <li>定期安全审计</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-3">五、信息共享</h2>
            <p className="text-gray-300 leading-relaxed">
              我们不会向第三方出售、出租或以其他方式分享您的个人信息，除非：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
              <li>获得您的明确同意</li>
              <li>法律法规要求</li>
              <li>保护本站或用户的合法权益</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-3">六、您的权利</h2>
            <div className="space-y-3 text-gray-300">
              <p>您对自己的个人信息享有以下权利：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>访问权</strong>：您可以查看我们持有的您的个人信息</li>
                <li><strong>更正权</strong>：您可以更新或更正不准确的信息</li>
                <li><strong>删除权</strong>：您可以要求删除您的个人信息</li>
                <li><strong>导出权</strong>：您可以要求导出您的数据</li>
              </ul>
              <p>如需行使以上权利，请通过网站内的反馈功能联系我们。</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-3">七、Cookie 使用</h2>
            <p className="text-gray-300 leading-relaxed">
              本站使用 Cookie 来保持您的登录状态和提供个性化体验。您可以通过浏览器设置管理 Cookie。
              禁用 Cookie 可能会影响部分功能的使用。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-3">八、未成年人保护</h2>
            <p className="text-gray-300 leading-relaxed">
              本站不面向14周岁以下的未成年人提供服务。如果您发现我们在不知情的情况下收集了未成年人的信息，
              请联系我们，我们将及时删除相关信息。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-3">九、政策更新</h2>
            <p className="text-gray-300 leading-relaxed">
              我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，请定期查看。
              如果您在政策更新后继续使用本站服务，即表示您同意更新后的政策。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-3">十、联系我们</h2>
            <p className="text-gray-300 leading-relaxed">
              如果您对本隐私政策有任何疑问或建议，请通过网站内的反馈功能联系我们。
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-purple-300 hover:text-purple-200">
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
