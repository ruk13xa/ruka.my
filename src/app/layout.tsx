import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';

const scdream = localFont({
  src: '../fonts/SCDream4.otf',
  display: 'swap',
  weight: '45 920',
  variable: '--font-scdream',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'ruka',
  description:
    'ruka의 포트폴리오. 인터페이스와 인터랙션의 경계를 실험하는 디자인 엔지니어의 프로젝트, 기술 스택, 경력을 소개합니다.',
  icons: {
    icon: '/favicon-cat.png',
  },
  openGraph: {
    title: 'ruka — Design Engineer Portfolio',
    description: '인터페이스와 인터랙션의 경계를 실험하는 디자인 엔지니어 ruka의 포트폴리오.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${scdream.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-scdream`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
