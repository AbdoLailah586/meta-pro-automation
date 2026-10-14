export const metadata = {
  title: 'سياسة الخصوصية | Meta Pro Automation',
  description: 'سياسة الخصوصية وحماية بيانات المستخدمين لتطبيق Meta Pro Suite',
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', fontFamily: 'system-ui, sans-serif', color: '#1E293B', lineHeight: '1.7', direction: 'rtl' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>سياسة الخصوصية (Privacy Policy)</h1>
      <p style={{ color: '#64748B', fontSize: '0.9rem' }}>آخر تحديث: 14 أكتوبر 2026</p>

      <section style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>1. مقدمة</h2>
        <p>
          نحن في منصة <strong>Meta Pro Automation</strong> نلتزم بحماية خصوصية وأمان بيانات مستخدمينا وعملائنا. توضح هذه الوثيقة كيفية جمع واستخدام وحماية البيانات عبر تكاملات منصات Meta (Facebook و Instagram) وتطبيق WhatsApp.
        </p>
      </section>

      <section style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>2. البيانات التي نجمعها</h2>
        <p>نقوم بجمع البيانات الضرورية فقط لتقديم خدمات الأتمتة وإدارة الحملات الإعلانية وصناديق المحادثات، وتشمل:</p>
        <ul>
          <li>معرفات الصفحات والحسابات الإعلانية المرتبطة بتفويض من المستخدم.</li>
          <li>الرسائل الواردة من العملاء عبر إعلانات فيسبوك وإنستغرام وواتساب لعرضها داخل صندوق الوارد الموحد.</li>
          <li>إحصائيات التفاعل ونسب الوصول للحملات والمنشورات التسويقية.</li>
        </ul>
      </section>

      <section style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>3. كيفية استخدام البيانات</h2>
        <p>تُستخدم البيانات حصراً للأغراض التالية:</p>
        <ul>
          <li>تمكين مديري التسويق من الرد على استفسارات العملاء القادمين من الإعلانات.</li>
          <li>جدولة ونشر المنشورات التسويقية وتحليل نتائج الحملات.</li>
          <li>توليد ردود ومقترحات تسويقية آلية باستخدام الذكاء الاصطناعي بناءً على رغبة المستخدم.</li>
        </ul>
        <p>نحن <strong>لا نبيع</strong> ولا نشارك أي بيانات شخصية مع أي جهات خارجية غير مصرح لها.</p>
      </section>

      <section style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>4. حذف البيانات (Data Deletion)</h2>
        <p>
          يحق لأي مستخدم طلب حذف جميع بياناته أو إلغاء ربط الحسابات في أي وقت عبر التواصل مع إدارة المنصة أو عبر إعدادات التطبيق في حسابه الشخصي على فيسبوك/إنستغرام، وسيتم حذف جميع البيانات المرتبطة به بشكل فوري ونهائي.
        </p>
      </section>

      <section style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>5. التواصل معنا</h2>
        <p>لأي استفسارات بخصوص سياسة الخصوصية وحماية البيانات، يرجى التواصل عبر:</p>
        <p>البريد الإلكتروني: <code style={{ color: '#0284C7' }}>support@meta-pro.app</code></p>
      </section>
    </div>
  );
}
