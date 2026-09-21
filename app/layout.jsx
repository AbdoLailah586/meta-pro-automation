import './globals.css';

export const metadata = {
  title: 'ميتا برو — أتمتة التسويق والذكاء الاصطناعي لفيسبوك وإنستغرام | Meta Pro Suite',
  description: 'المنصة الاحترافية لإدارة وجدولة حملات ومنشورات فيسبوك وإنستغرام وتوليد المحتوى التسويقي بالذكاء الاصطناعي مجاناً',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="theme-color" content="#07090D" />
      </head>
      <body>{children}</body>
    </html>
  );
}
