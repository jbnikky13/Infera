import './globals.css'

export const metadata = {
  title: 'Infera — News, Signals & Intelligence',
  description: 'Understand what happened, why it matters, and what is moving next.',
}

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>
}
