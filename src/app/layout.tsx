import './globals.css';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/ThemeProvider';

const scdream = localFont({
  src: '../fonts/SCDream4.otf',
  display: 'swap',
  weight: '45 920',
  variable: '--font-scdream',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${scdream.variable} font-scdream`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
