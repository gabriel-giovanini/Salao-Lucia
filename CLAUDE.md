# Studio Lucia Ferraz — regras do projeto

Site estático (HTML + Tailwind CDN + GSAP/ScrollTrigger + Lenis + Lucide), sem back-end.
Objetivos: **destacar que o Studio é consultora Moments Paris**, vitrine de produtos e
**solicitação de agendamento pelo WhatsApp** (5519971602364).

## Identidade visual
- Base preto & branco (cores da Moments Paris). Acentos femininos/"divo": rosa `--pink #ff4f9a`,
  `--blush #ffc2dc`, brilhos e shimmer. Cada produto tem cor própria (`products[].colors`).
- Tipografia: **Plus Jakarta Sans** (títulos e texto) e **Syne** (caps/etiquetas, `.font-caps`). Fontes antigas
  (Cormorant, Cinzel, Manrope) não são mais usadas.
- O Studio **não tem logotipo**: usar o nome em texto (wordmark). Logo da Moments Paris em `Assets/Marcas/`.
- Diferenciais LGBTQ+ / empreendedoras aparecem, mas com destaque menor que Moments Paris.

## Animação — anima ao ENTRAR e ao SAIR, nunca o tempo todo
- **Performance primeiro:** nada de animação infinita, loop de `requestAnimationFrame`, canvas de partículas
  ou camada animada em tela cheia (o site travava). Animações só ao entrar/sair da tela, ao trocar produto
  ou no hover. Faixas (marquee) se movem apenas enquanto a página rola.
- O topo é minimalista: foto, marca curta, nome, preço e um botão. Sem descrições longas.
- Hero = palco 3D com coreografia orbital (produto atual + anterior/próximo em órbita, `data-orbit-*` em `js/main.js`),
  com arraste por toque e mouse. Todos os produtos usam o mesmo tamanho/base no palco e sombra no chão.
- **Nunca** desligar animações por `prefers-reduced-motion` (pedido explícito do cliente).
- Revelações: classe `.rv` + `data-anim="up|down|left|right|scale|blur|rotate|flip|clip|clipx|pop"`,
  atraso via `style="--d:.1s"`. Títulos com `data-split` (letra a letra). Funciona via IntersectionObserver
  + CSS, sem depender de CDN.
- Transições do topo com Web Animations API (nativo). GSAP/ScrollTrigger só para efeitos de scroll extra; Lenis para scroll suave.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` / mola `cubic-bezier(0.34, 1.56, 0.64, 1)`. Nada linear seco (exceto loops contínuos).
- Glass: `backdrop-filter: blur(16px)`, borda `1px solid rgba(255,255,255,0.15)`, sombras realistas.
- Micro-interações: `data-magnetic`, `data-tilt`, cursor, brilho que atravessa botões.

## Regras de conteúdo (NÃO violar)
- Não inventar e-mail, Instagram, preços, promoções, profissionais, certificações, tempo de atuação,
  coordenadas, estacionamento, acessibilidade, formas de pagamento ou domínio. Produtos sem preço → "Sob consulta".
- Exceção pedida pelo cliente: os preços atuais dos produtos são **FICTÍCIOS** (marcados no config) e devem ser
  trocados pelos reais antes de publicar.
- Horários não confirmados → "Consulte os horários disponíveis pelo WhatsApp."
- Sem carrinho/sacola/checkout/pagamento: produtos e agendamento vão para o WhatsApp.
- Nunca exibir "Agendamento confirmado" ou "Mensagem enviada". Botão do formulário: "Continuar no WhatsApp".
- Não inventar depoimentos. Nota 5,0 / 24 avaliações é dado de cadastro (não integração ao vivo).
- Link office.momentsparis.com.br continua desativado até confirmar a finalidade.
- JSON-LD `BeautySalon` só com dados confirmados e sem `aggregateRating`/`review`.

## Onde editar
- Produtos atuais (fotos PNG sem fundo em `Assets/Produtos/`, ver MIDIAS.md): Best Girl Moments, Cabelo Pele & Unhas
  (Moments Paris); Honey Mask 3D, Kit Guard & Honey, Fios Hidratados nº 1 (Vogens Profissional).
  SVGs em `Assets/Produtos/ilustracoes/` são reserva.
- Todos os dados: `js/config.js` (produtos, estabelecimento, contatos, horários, serviços, mídias, avaliações, mensagens).
- Metadados/JSON-LD estáticos: `<head>` de `index.html`.
- `npm run dev` (http://localhost:5173) · `npm run check` · `npm run build` (gera `dist/`).
