export const metadata = {
  title: 'شروط الخدمة | Meta Pro Automation',
  description: 'شروط وأحكام استخدام منصة Meta Pro Suite',
};

export default function TermsOfServicePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', fontFamily: 'system-ui, sans-serif', color: '#1E293B', lineHeight: '1.7', direction: 'rtl' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>شروط الخدمة (Terms of Service)</h1>
      <p style={{ color: '#64748B', fontSize: '0.9rem' }}>آخر تحديث: 14 أكتوبر 2026</p>

      <section style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>1. قبول الشروط</h2>
        <p>باستخدامك لمنصة Meta Pro Automation، فإنك توافق على الالتزام بشروط وأحكام الخدمة وسياسات الاستخدام العادل وسياسات منصات Meta.</p>
      </section>

      <section style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight 700 }}>2. الاستخدام المسموح به</h2>
        <p>تُستخدم المنصة لأغراض التسويق القانوني وإدارة خدمة العملاء عبر منصات فيسبوك، إنستغرام، وواتساب بما يتوافق مع القوانين السارية وسياسات مكافحة البريد العشوائي (Anti-Spam).</p>
      </section>
    </div>
  );
}
