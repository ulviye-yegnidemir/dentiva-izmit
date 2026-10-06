import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'DENTIVA | İzmit Diş Kliniği & Online Randevu' },
      {
        name: 'description',
        content:
          'İzmit Dentiva Ağız ve Diş Sağlığı Kliniği’nde modern diş tedavileri ve kolay online randevu. Sağlıklı gülüşler, mutlu yarınlar.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'DENTIVA | İzmit Diş Kliniği' },
      {
        property: 'og:description',
        content: 'Kişiye özel modern diş hekimliği ve online randevu.',
      },
    ],
    links: [{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head><HeadContent /></head>
      <body><>{children}<Scripts /></></body>
    </html>
  )
}
