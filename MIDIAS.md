# Registro de mídias

Todos os caminhos ficam em `js/config.js` (`products[].image` e `media`). Para trocar uma mídia, coloque o arquivo em `Assets/` e altere o caminho; não é preciso mexer nas seções.

## Produtos — fotos recortadas em alta resolução (em uso)

As 5 embalagens recortadas sem fundo (PNG transparente) enviadas pelo cliente estão em uso no palco 3D do topo e na vitrine:

| Arquivo | Produto | Marca |
|---|---|---|
| `Assets/Produtos/best-girl-moments.png` | Best Girl Moments (200 g) | Moments Paris |
| `Assets/Produtos/cabelo-pele-unhas.png` | Cabelo, Pele & Unhas (30 cápsulas) | Moments Paris |
| `Assets/Produtos/honey-mask.png` | Honey Mask 3D (500 g) | Vogens Profissional |
| `Assets/Produtos/kit-honey-guard.png` | Kit Guard & Honey (4 itens) | Vogens Profissional |
| `Assets/Produtos/fios-hidratados-shampoo.png` | Fios Hidratados nº 1 (Shampoo · 2,5 L) | Vogens Profissional |

As ilustrações vetoriais anteriores em `Assets/Produtos/ilustracoes/*.svg` foram mantidas na pasta como reserva.

## Enviadas pelo cliente

| Arquivo | Situação |
|---|---|
| `Assets/Produtos/*.png` / `*.jpg` | Fotos originais (baixa resolução) — mantidas, não usadas |
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
