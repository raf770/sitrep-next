import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAzklEQVR4nO3WPU4DMRCG4fcb708CQtREpE6FlEPk4jR0XAFRcASyuwTsSUef2ShRJFtyOfJTzDcerTY754rHrvl4BVRABVRABZwFIGlWfRMtdPf/m1K6LMDd6dqWpm0wE+M4UUrsUz0ZIInD4Zfty4b18xOPD/e8vr3z8flF33W4nwYJ9YBM7IeJu2XP934g54KI9YIiC4m7s1j0mIlhmGhSIpcSAoR6QBLj+AM4ZsZfzuE0hFNgJoRw5kVx1hw4xzJ5+5OwAiqgAirg5gFHI888E7GQNpkAAAAASUVORK5CYII=" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
