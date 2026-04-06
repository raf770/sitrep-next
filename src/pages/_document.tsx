import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABbElEQVR4nO3WvU4bQRDA8f+c78Dn43CsALYAUSABUpQ0FBRUURQJiYYXpOIB0qRCNEmHEB8FEm/Ah+zIkQ22z7d7uxRg115IoNltdrr57czsamVx47vlHVfwnsk9wAM8wAM84FUAERnvo/hNACKCMYY8V4gIuVLP8RsARASlNHFcZnmpjlKa+vxHlhcX0Lp4ESB0Sa615kM1ZW/3K/1BRq8/4MunNa5vmzRbbX4e/iZNEowxEwMcWyAYa2jU57i5a9H685dmq83ZxRUL8zVMYZxbIS4fEmstlbhMrTbL1uZnGvU5qtUZtCo4+nXMyekllbiMsZP/cZwqUBjD9PQUO9+2KQpDp/vA2fkV+wc/WF9dQReF841wqsBoCGfThDRNuL5tklRiVK4Io5DhMHcGTDyE8NSCKAq57/XpdB+IopAsGyIiZFlOELjfRSfACFEKAsJSCWvt+MQvSQ6veAmtw6D9F8C/Wh7gAR7gAY/2OoS46W0GnwAAAABJRU5ErkJggg==" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
