'use client';
 
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProviderProps } from 'next-themes';
 
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute='class' defaultTheme='system' {...props}>
      {children}
    </NextThemesProvider>
  );
}