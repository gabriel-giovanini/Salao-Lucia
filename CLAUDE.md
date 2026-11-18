# Studio Lucia Ferraz — regras do projeto

Site estático (HTML + Tailwind **compilado em `css/tailwind.css`** + GSAP/ScrollTrigger + Lenis + Lucide), sem back-end.
**Não volte a usar o Tailwind CDN**: ele compilava no navegador a cada mudança do DOM e travava a página.
Classe nova do Tailwind no HTML/JS → rode `npm run tailwind` para regenerar o CSS.
Objetivos: **destacar que o Studio é consultora Moments Paris**, vitrine de produtos e
**solicitação de agendamento pelo WhatsApp** (5519971602364).

## Identidade visual
- Base preto & branco (cores da Moments Paris). Acentos femininos/"divo": rosa `--pink #ff4f9a`,
  `--blush #ffc2dc`, brilhos e shimmer. Cada produto tem cor própria (`products[].colors`).
- Tipografia do **topo e cabeçalho** (sistema do site de referência Batal): **Montserrat** 500–900 (título 800, preço 700,
  kicker 700 12px .25em, menu 600 13px, logo 800 .22em, marca d'água 900 só contorno) e **DM Sans** (descrição 15px/1.65, botões).
  Demais seções: **Plus Jakarta Sans** + **Syne** (`.font-caps`).
- Logo: monograma branco “LF” (Montserrat 900) + “STUDIO LUCIA FERRAZ”; o quadradinho gira -8° no hover.
- O Studio **não tem logotipo**: usar o nome em texto (wordmark). Logo da Moments Paris em `Assets/Marcas/`.
- Diferenciais LGBTQ+ / empreendedoras aparecem, mas com destaque menor que Moments Paris.

## Animação — anima ao ENTRAR e ao SAIR, nunca o tempo todo
- **Performance primeiro:** nada de animação infinita, loop de `requestAnimationFrame`, canvas de partículas
  ou camada animada em tela cheia (o site travava). Animações só ao entrar/sair da tela, ao trocar produto
  ou no hover. Faixas (marquee) se movem apenas enquanto a página rola.
- O topo é minimalista: foto, marca curta, nome, preço e um botão. Sem descrições longas.
- Topo (hero) vive em **`js/hero.js`** (`window.SLFHero`): fotos com recorte automático da transparência (canvas) e
  normalizadas a 85% × 88% de uma caixa quadrada (`scale` por produto no config), transições com mola (GSAP),
  tilt 3D/parallax no mouse, setas, teclado ← →, swipe, miniatura “próximo”, bolinhas de progresso, seletores
  com contagem de preço e voo do produto até o WhatsApp. Fundo do topo = `colors: [claro, médio, escuro]` do produto.
- **Exceções pedidas (2026-11-18):** levitação contínua do produto/miniatura e sombra no chão (CSS, só `transform`/`opacity`)
  e granulado estático no topo. CSS no wrapper, GSAP no filho — nunca no mesmo elemento.
- `prefers-reduced-motion` (Windows com efeitos de animação desligados): o topo **continua** com abertura, trocas com mola,
  textos nas máscaras e contagem de preço; só a levitação infinita e o tilt são desligados. Nunca desligar o site inteiro.
- Performance do topo: anime só `transform`/`opacity`; cores do fundo animadas no `.hx-bg` (nunca no `:root`);
  sombra com `blur` fixo; nada de `mix-blend-mode`/`backdrop-filter` em elementos grandes ou que se movem;
  GSAP nunca em elemento com `translate` do CSS (ele congela em pixels — centralize com flex); `busy` com `setTimeout` de segurança.
- Fotos dos produtos: usar as versões de `Assets/Produtos/otimizadas/` (WebP recortado ≤ 1000 px + miniatura 300 px, `pretrimmed: true`).
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
