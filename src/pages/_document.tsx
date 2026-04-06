import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABs0lEQVR4nO2XSyiEURTHf99nhkTe8kg08piUUrKaJJFIJAt2LDySndfCI1kom/FYkJCNhWxEKMmjKG8akTKJlAyhwY4yM1amMd/MxsfM5vvvzu2e/r97OveeroCTYlPzbc5rfymTcU1wjO3Bfxu7AxG9Ye7oKXra2FmCN07vKK9XQAFQAFSuFtPTkulorUGtUvH5aaG5U4/p/omrkyUMZ0YEBAID/OnpG2X38FQWgMtruDo/RlVDF/cPTxQXZFNSlENDUy8Xh/Nos8oA0KZoGNG3k1daLwvAZQUiwkPw81UDsLKxy7P5VbLHeHlDdFSELHO3AH0Dk8xND7KxecDswjo7+yeSPTm6TLb3DLIB3L6EwUGBFObrqKsuZ3l1m/7hKXsPqFU+JCXGk1tcy+Oz+W8BwsOC0STEcWQ4t8frixNk6Cp+9EBjbSWiKDA8PiMLQHINbTYYG+oiNiYSgNCQIO5Mj5LErZ1jMtK1sszBRQ+YX95o6x5kfKib948PLBYrLR16SeLV9S1pqRpEUcBq/f08U6ahAqAAKAAKgOj8V/OkTMY1wfsV+CbxtPG3p8TY09/zL94fj2T0R4JsAAAAAElFTkSuQmCC" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
