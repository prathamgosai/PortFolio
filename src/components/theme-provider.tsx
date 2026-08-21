"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * This used to be `defaultTheme="dark" enableSystem={false}`, which ignored the
 * visitor's OS setting entirely. Now the system preference decides the first
 * paint and the navbar toggle still overrides it (persisted to localStorage).
 *
 * NOW DARK-ALWAYS. The site renders inside a night sky with a sun in it, and
 * that environment is the design — landing a visitor in the light theme shows
 * them a different product. The toggle still works and light is still fully
 * contrast-checked, so anyone who wants it is one click away.
 *
 * This does override the OS preference, which is a real cost and a deliberate
 * one. To hand control back:
 *     defaultTheme="system" enableSystem
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
