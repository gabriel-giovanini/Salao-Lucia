# Registro de mídias

Todos os caminhos ficam em `js/config.js` (`products[].image` e `media`). Para trocar uma mídia, coloque o arquivo em `Assets/` e altere o caminho; não é preciso mexer nas seções.

## Enviadas pelo cliente

| Arquivo | Uso |
|---|---|
| `Assets/Produtos/Mascara de Cabelo - sem fundo.png` | Produto "Moments Mask" (topo, vitrine, bento) |
| `Assets/Produtos/Condicionador - sem fundo.png` | Produto "Condicionador Moments" |
| `Assets/Produtos/Condicionador (2) - sem fundo.png` | Produto "Fios Hidratados nº 2" |
| `Assets/Produtos/Shampoo - sem fundo.png` | Produto "Shampoo Fios Hidratados" |
| `Assets/Marcas/moments-paris.png` | Logotipo Moments Paris original (fundo preto), enviado no chat |
| `Assets/Marcas/moments-paris-branco.png` | Mesma imagem convertida para branco com fundo transparente (usada no site) |

As versões com fundo (`.jpg` / `Mascara de Cabelo.png`) não são usadas.

## Provisórias (não representam o Studio)

| Arquivo | Uso | Origem |
|---|---|---|
| `Assets/Midia/provisorias/arte-*.svg` | Cards "Como funciona" | Arte vetorial abstrata gerada para o projeto |
| `Assets/Midia/provisorias/textura-seda.svg` | Poster do vídeo | Idem |
| `Assets/Midia/provisorias/og-image.png` | Imagem de compartilhamento (1200×630) | Gerada localmente (texto + logo Moments) |
| Fundo animado da seção "O Studio" | Enquanto não há vídeo | Gradientes CSS |
| `favicon.svg` | Ícone da aba | Gerado (monograma "LF") |

Nenhuma imagem de banco foi usada.

## Aguardando envio

| Pasta | Configuração |
|---|---|
| `Assets/Salão/` | `media.salao`, `services.items[].image` |
| `Assets/Midia/video/bastidores.mp4` | `media.video.src` (MP4 H.264, sem áudio, ideal ≤ 8 MB) |
| Fotos de produtos em alta | `products[].image` |

Imagens que não carregam viram um gradiente (sem ícone quebrado); vídeo ausente mantém o fundo animado.
