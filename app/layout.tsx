import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nearline — Your personal workspace',
  description: 'A calm, focused space for everything you need to keep nearline.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
