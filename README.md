# Studio Lucia Ferraz — site

Site estático (uma página + política de privacidade + 404) para **solicitação de agendamento pelo WhatsApp**.
Sem banco de dados, sem servidor de envio, sem carrinho/pagamento. Nenhum dado do formulário é armazenado.

## Executar localmente

Requer Node.js 20+ (sem dependências para instalar).

```bash
npm run dev
```

Abra http://localhost:5173. Para verificar tudo (sintaxe, config, links, mídias, testes):

```bash
npm run check
```

## Estrutura

```
index.html            página principal (7 seções + formulário + gaveta)
privacidade.html      política de privacidade
404.html              página de erro
css/styles.css        estilos (glass, animações, componentes)
js/config.js          ★ TODOS os dados editáveis
js/whatsapp.js        montagem/validação da mensagem (funções puras, testadas)
js/main.js            renderização e interações (GSAP, Lenis, carrosséis, formulário)
Assets/Logos/         logotipos (vazio — enviar)
Assets/Salão/         fotos reais do estabelecimento (vazio — enviar)
Assets/Midia/         mídias do site (provisórias + pasta video/)
scripts/              servidor local, verificação e build
tests/                testes da mensagem do WhatsApp
```

Bibliotecas via CDN: Tailwind CSS 3.4.16, GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13, Lucide 0.460.0, Google Fonts (Fraunces + Manrope).
Se algum CDN falhar, o conteúdo continua visível e o formulário continua funcionando.

## Como atualizar os dados (js/config.js)

| O quê | Onde |
|---|---|
| Produtos (topo + vitrine) | `products` — nome, tipo, marca, imagem, cores, `price` (null = "Sob consulta"), `published` |
| Linhas de produtos (abas) | `productCategories` |
| Logo Moments Paris | `media.momentsLogo` |
| Telefone / WhatsApp | `contact` |
| Endereço e busca do Maps | `address` |
| Horários | `hours` → `confirmed: true` e preencha `schedule` |
| Mensagens do WhatsApp | `whatsapp` |
| Redes sociais | `links.social` (só endereços oficiais) |
| Logotipo | `media.logo` (ex.: `"Assets/Logos/logo.svg"`) |
| Vídeo dos bastidores | coloque `Assets/Midia/video/bastidores.mp4` (ou altere `media.video.src`) |
| Fotos do salão | `media.salao` |
| Slides do topo | `hero` |
| Faixa em movimento | `marquee` |
| Serviços | `services.items` — publique com `published: true` |
| Avaliações reais | `reviews.items`; resumo (nota/quantidade) em `reviews.summary` |

### Cadastrar um serviço

```js
{
  id: "corte-feminino",
  name: "Corte feminino",
  description: "Texto curto.",
  image: "Assets/Salão/corte.jpg",   // ou uma chave de media.art, ex.: "petala"
  category: "cabelo",                // id existente em services.categories
  price: null,                       // "R$ 120,00" quando confirmado
  duration: null,                    // "1h" quando confirmado
  published: true,
  whatsappMessage: "Olá, Studio Lucia Ferraz! Vim pelo site e gostaria de saber mais sobre [serviço] e consultar a disponibilidade."
}
```

Com ao menos um serviço publicado, a seção passa a mostrar abas por categoria e cards; o formulário vira uma lista de seleção com a opção “Outro (descrever)”.
Sem serviços publicados, o site mostra uma chamada geral para conhecer os serviços pelo WhatsApp.

### Cadastrar uma avaliação real

```js
{ name: "Nome de exibição", text: "Texto integral, sem completar trechos.", rating: 5,
  source: "Google", url: "https://...", verifiedAt: "2026-11-17" }
```

O carrossel 3D só aparece quando houver avaliações reais cadastradas.

> Dados estruturados (JSON-LD) e metadados ficam no `<head>` de `index.html`. Se mudar telefone/endereço, atualize ali também.

## Publicação (Vercel)

`vercel.json` já define:

- **Install:** nenhum (sem dependências)
- **Build:** `npm run build` → roda `npm run check` e copia só os arquivos do site para `dist/`
- **Saída:** `dist`
- `cleanUrls` (`/privacidade` funciona) e 404 em `404.html`

Nada foi publicado. Quando o domínio for definido:

1. Em `js/config.js`, preencha `business.siteUrl`.
2. Em `index.html`, ative `<link rel="canonical">`, troque `og:image` por URL absoluta e adicione `"url"` ao JSON-LD.
3. Crie `sitemap.xml` (modelo abaixo) e descomente a linha `Sitemap:` em `robots.txt`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://SEU-DOMINIO/</loc></url>
  <url><loc>https://SEU-DOMINIO/privacidade</loc></url>
</urlset>
```

## Privacidade e segurança

- O formulário só monta a mensagem no navegador e abre `wa.me` com `encodeURIComponent`. Não há envio a servidor, logs ou analytics.
- Campos com limite de tamanho, remoção de caracteres de controle e escape de HTML na renderização.
- Nenhuma chave, token ou senha no frontend.
- O site nunca afirma “mensagem enviada” ou “agendamento confirmado”.
- Se no futuro houver agenda online, pagamentos ou armazenamento de pedidos, tratar como integração nova com validação no servidor e proteção contra abuso.
