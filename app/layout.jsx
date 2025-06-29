import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Jadwal Sholat Mushola An-Nur | Salamrejo, Karangan, Trenggalek",
  description: "Jadwal waktu sholat lima waktu, tanggal Hijriyah, dan informasi keagamaan Mushola An-Nur, RT 02/RW 01, Dusun Josari, Desa Salamrejo, Kecamatan Karangan, Kabupaten Trenggalek. Dilengkapi doa-doa pilihan dan waktu sholat real-time.",
  keywords: "jadwal sholat, mushola an-nur, trenggalek, karangan, salamrejo, waktu sholat, tanggal hijriyah, doa harian, islamic app",
  authors: [{ name: "Mushola An-Nur" }],
  creator: "Mushola An-Nur",
  publisher: "Mushola An-Nur",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Jadwal Sholat Mushola An-Nur",
    description: "Aplikasi jadwal sholat lima waktu dengan tanggal Hijriyah untuk Mushola An-Nur, Salamrejo, Karangan, Trenggalek",
    url: 'http://localhost:3000',
    siteName: 'Jadwal Sholat Mushola An-Nur',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Jadwal Sholat Mushola An-Nur',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Jadwal Sholat Mushola An-Nur",
    description: "Jadwal sholat lima waktu dengan tanggal Hijriyah - Mushola An-Nur, Trenggalek",
    images: ['/api/og'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicons.ico',
    shortcut: '/favicons.ico',
    apple: '/favicons.ico',
  },
  manifest: '/manifest.json',
  category: 'religion',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#dfb631',
  colorScheme: 'light',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://api.aladhan.com" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Jadwal Sholat" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#dfb631" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
