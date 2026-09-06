import './globals.css'

export const metadata = {
  title: 'Infera — News, Signals & Intelligence',
  description: 'Understand what happened, why it matters, and what is moving next.',
  applicationName: 'Infera',
  keywords: ['news intelligence', 'business news', 'market intelligence', 'Africa news', 'trends', 'entertainment'],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Infera — News, Signals & Intelligence',
    description: 'Business, markets, trends, entertainment and Africa — with context behind the headline.',
    type: 'website',
  },
}

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>
}
