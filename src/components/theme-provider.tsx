"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * This used to be `defaultTheme="dark" enableSystem={false}`, which ignored the
 * visitor's OS setting entirely. Now the system preference decides the first
 * paint and the navbar toggle still overrides it (persisted to localStorage).
 *
 * NOTE — this is a visible change: most Windows/Android users report `light`,
 * so they now land on the light theme rather than the cinematic dark one. Both
 * themes are contrast-checked and pass AA. To go back to dark-always, this is
 * the only line that needs changing:
 *     defaultTheme="dark" enableSystem={false}
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
