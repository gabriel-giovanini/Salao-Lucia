/* ==========================================================================
   STUDIO LUCIA FERRAZ — CONFIGURAÇÃO CENTRAL
   --------------------------------------------------------------------------
   Edite APENAS este arquivo para atualizar dados, produtos, mídias,
   serviços, avaliações e mensagens. As seções do site leem tudo daqui.
   Veja PENDENCIAS.md e MIDIAS.md.
   ========================================================================== */
window.SITE_CONFIG = {
  /* ---------------------------------------------------------------------- */
  business: {
    name: "Studio Lucia Ferraz",
    segment: "Salão de beleza",
    language: "pt-BR",
    // Destaque principal (confirmado pelo cliente)
    consultant: { brand: "Moments Paris", label: "Consultora Moments Paris" },
    // Características informadas pelo cadastro
    traits: ["Empresa de empreendedoras", "Acolhe a comunidade LGBTQ+"],
    // Domínio definitivo ainda NÃO definido (ver README.md).
    siteUrl: null,
  },

  /* ---------------------------------------------------------------------- */
  contact: {
    phoneDisplay: "(19) 97160-2364",
    phoneHref: "tel:+5519971602364",
    whatsappNumber: "5519971602364", // formato internacional, só dígitos
  },

  /* ---------------------------------------------------------------------- */
  address: {
    street: "Av. Jacaúna, 2634",
    neighborhood: "Vila Aeroporto",
    city: "Campinas",
    state: "SP",
    postalCode: "13054-107",
    country: "BR",
    mapsQuery:
      "Studio Lucia Ferraz, Av. Jacaúna, 2634, Vila Aeroporto, Campinas, SP, 13054-107",
  },

  /* ---------------------------------------------------------------------- */
  hours: {
    // Quando confirmados: confirmed: true e preencha "schedule".
    confirmed: false,
    fallbackText: "Consulte os horários disponíveis pelo WhatsApp.",
    // Ex.: { days: "Terça a sábado", time: "09:00 – 18:00" }
    schedule: [],
  },

  /* ---------------------------------------------------------------------- */
  whatsapp: {
    defaultMessage:
      "Olá, Studio Lucia Ferraz! Vim pelo site e gostaria de conhecer os serviços e consultar a disponibilidade para agendamento.",
    formHeader: "Olá, Studio Lucia Ferraz! Gostaria de consultar um agendamento.",
    formNotice:
      "Sua solicitação será encaminhada pelo WhatsApp. A disponibilidade e o agendamento serão confirmados pela equipe.",
    // [produto] é trocado pelo nome do produto
    productMessage:
      "Olá, Studio Lucia Ferraz! Vi o produto [produto] no site e gostaria de saber o valor e a disponibilidade.",
    momentsMessage:
      "Olá, Studio Lucia Ferraz! Vim pelo site e gostaria de conhecer os produtos Moments Paris.",
    periods: ["Manhã", "Tarde", "Sem preferência"],
  },

  /* ---------------------------------------------------------------------- */
  links: {
    mapsBase: "https://www.google.com/maps/search/?api=1&query=",
    // Só endereços oficiais confirmados. Ex.: { label: "Instagram", url: "https://...", icon: "instagram" }
    social: [],
    // Finalidade/vínculo ainda não verificados → desativado.
    momentsParis: { url: "https://office.momentsparis.com.br", show: false },
  },

  /* ---------------------------------------------------------------------- */
  media: {
    // O Studio não tem logotipo: o site usa o nome em texto.
    logo: null,
    logoAlt: "Studio Lucia Ferraz",
    // Logotipo da Moments Paris (enviado pelo cliente)
    momentsLogo: "Assets/Marcas/moments-paris-branco.png",
    ogImage: { src: "Assets/Midia/provisorias/og-image.png", provisional: true },
    video: {
      src: "Assets/Midia/video/bastidores.mp4",
      poster: "Assets/Midia/provisorias/textura-seda.svg",
      provisional: true,
    },
    // Fotos reais do estabelecimento (Assets/Salão). Ex.: { src: "Assets/Salão/recepcao.jpg", alt: "Recepção" }
    salao: [],
    art: {
      petala: { src: "Assets/Midia/provisorias/arte-petala.svg", provisional: true },
      seda: { src: "Assets/Midia/provisorias/arte-seda.svg", provisional: true },
      espelho: { src: "Assets/Midia/provisorias/arte-espelho.svg", provisional: true },
      joia: { src: "Assets/Midia/provisorias/arte-joia.svg", provisional: true },
      textura: { src: "Assets/Midia/provisorias/textura-seda.svg", provisional: true },
    },
  },

  /* ---------------------------------------------------------------------- */
  // PRODUTOS — aparecem no palco do topo e na vitrine.
  // ATENÇÃO: os preços atuais são FICTÍCIOS (exemplo pedido pelo cliente) — troque pelos reais antes de publicar.
  // price: null = "Sob consulta". colors: [claro, médio, escuro] (fundo do topo, interpolado na troca).
  // watermark: palavra gigante atrás do produto no topo.
  productCategories: [
    { id: "moments", label: "Moments Paris" },
    { id: "vogens", label: "Vogens Profissional" },
  ],
  products: [
    {
      id: "best-girl-moments",
      name: "Best Girl Moments",
      tagline: "Hidratação & perfume em cada toque",
      type: "Hidratante corporal · 200 g",
      brand: "Moments Paris",
      category: "moments",
      volume: "200g",
      image: "Assets/Produtos/best-girl-moments.png",
      description: "Hidratante corporal perfumado Best Girl da Moments Paris (200 g). Peça com a consultora e consulte valor e disponibilidade pelo WhatsApp.",
      watermark: "MOMENTS",
      colors: ["#f1cf8a", "#9a6a2a", "#140c05"], // [claro, médio, escuro] — fundo do topo
      price: "R$ 79,90", // FICTÍCIO
      oldPrice: "R$ 99,90", // FICTÍCIO
      // Apresentação no topo (hero)
      kicker: "Moments · Best Girl",
      title: ["Best Girl", "Moments"],
      taglineLines: ["Hidratação & perfume", "em cada toque"],
      scale: 1, // ajuste fino do tamanho no palco (ex.: 1.1)
      optLabel: "Escolha o produto:",
      option: "200 g", // vai na mensagem do WhatsApp
      published: true,
    },
    {
      id: "cabelo-pele-unhas",
      name: "Cabelo, Pele & Unhas",
      tagline: "Rico em biotina e antioxidantes",
      type: "Suplemento · 30 cápsulas",
      brand: "Moments Paris",
      category: "moments",
      volume: "30 cáps",
      image: "Assets/Produtos/cabelo-pele-unhas.png",
      description: "Suplemento alimentar Moments Paris rico em biotina e antioxidantes (30 cápsulas · 720 mg). Zero açúcares e sem glúten. Consulte valor e disponibilidade.",
      watermark: "PARIS",
      colors: ["#c98bff", "#6a1f9e", "#13051c"], // [claro, médio, escuro] — fundo do topo
      price: "R$ 89,90", // FICTÍCIO
      oldPrice: "R$ 119,90", // FICTÍCIO
      // Apresentação no topo (hero)
      kicker: "Moments · Cabelo Pele & Unhas",
      title: ["Cabelo, Pele", "& Unhas"],
      taglineLines: ["Rico em biotina", "e antioxidantes"],
      scale: 1, // ajuste fino do tamanho no palco (ex.: 1.1)
      optLabel: "Escolha o produto:",
      option: "30 cápsulas", // vai na mensagem do WhatsApp
      published: true,
    },
    {
      id: "honey-mask",
      name: "Honey Mask 3D",
      tagline: "Nutrição 3D e brilho de diamante",
      type: "Máscara biotecnológica · 500 g",
      brand: "Vogens Profissional",
      category: "vogens",
      volume: "500g",
      image: "Assets/Produtos/honey-mask.png",
      description: "Máscara capilar biotecnológica com ação queratina, brilho de diamante e D-Pantenol (500 g). Uso profissional para cabelos mais fortes.",
      watermark: "HONEY",
      colors: ["#ffc94d", "#c27a0e", "#241102"], // [claro, médio, escuro] — fundo do topo
      price: "R$ 99,90", // FICTÍCIO
      oldPrice: "R$ 129,90", // FICTÍCIO
      // Apresentação no topo (hero)
      kicker: "Vogens · Honey Mask",
      title: ["Honey", "Mask 3D"],
      taglineLines: ["Nutrição 3D e", "brilho de diamante"],
      scale: 1, // ajuste fino do tamanho no palco (ex.: 1.1)
      optLabel: "Escolha o produto:",
      option: "500 g", // vai na mensagem do WhatsApp
      published: true,
    },
    {
      id: "kit-honey-guard",
      name: "Kit Guard & Honey",
      tagline: "Tratamento capilar completo no salão",
      type: "Linha profissional · Kit 4 itens",
      brand: "Vogens Profissional",
      category: "vogens",
      volume: "Kit",
      image: "Assets/Produtos/kit-honey-guard.png",
      description: "Linha profissional Vogens com Honey Mask (500 g) e tratamento capilar Guard (Shampoo 1000 ml + Condicionador + Leave-in 240 ml). Consulte disponibilidade.",
      watermark: "GUARD",
      colors: ["#e3cf98", "#5a4f3b", "#0b0a08"], // [claro, médio, escuro] — fundo do topo
      price: "R$ 249,90", // FICTÍCIO
      oldPrice: "R$ 299,90", // FICTÍCIO
      // Apresentação no topo (hero)
      kicker: "Vogens · Kit Guard & Honey",
      title: ["Kit Guard", "& Honey"],
      taglineLines: ["Tratamento capilar", "completo no salão"],
      scale: 1, // ajuste fino do tamanho no palco (ex.: 1.1)
      optLabel: "Escolha o produto:",
      option: "Kit 4 itens", // vai na mensagem do WhatsApp
      published: true,
    },
    {
      id: "fios-shampoo",
      name: "Fios Hidratados nº 1",
      tagline: "Hidratação profunda e controle do frizz",
      type: "Shampoo hidratante · 2,5 L",
      brand: "Vogens Profissional",
      category: "vogens",
      volume: "2,5L",
      image: "Assets/Produtos/fios-hidratados-shampoo.png",
      description: "Shampoo Hidratante Fios Hidratados Passo 1 (2,5 L) — pH balanceado, sem parabenos e brilho intenso. Consulte valor e disponibilidade pelo WhatsApp.",
      watermark: "FIOS",
      colors: ["#ffa857", "#a8460c", "#1a0903"], // [claro, médio, escuro] — fundo do topo
      price: "R$ 129,90", // FICTÍCIO
      oldPrice: "R$ 159,90", // FICTÍCIO
      // Apresentação no topo (hero)
      kicker: "Vogens · Fios Hidratados",
      title: ["Fios", "Hidratados nº 1"],
      taglineLines: ["Hidratação profunda e", "controle do frizz"],
      scale: 1, // ajuste fino do tamanho no palco (ex.: 1.1)
      optLabel: "Escolha o produto:",
      option: "2,5 L", // vai na mensagem do WhatsApp
      published: true,
    },
  ],

  /* ---------------------------------------------------------------------- */
  // Faixas em movimento — apenas fatos confirmados.
  marquee: [
    "Consultora Moments Paris",
    "Studio Lucia Ferraz",
    "Salão de beleza em Campinas",
    "Nota {rating} no Google",
    "Agende pelo WhatsApp",
  ],
  marquee2: [
    "Empresa de empreendedoras",
    "Vila Aeroporto",
    "Produtos Moments Paris",
    "Atendimento por agendamento",
    "Todas as pessoas são bem-vindas",
  ],

  /* ---------------------------------------------------------------------- */
  services: {
    categories: [
      { id: "cabelo", label: "Cabelo" },
      { id: "unhas", label: "Unhas" },
      { id: "estetica", label: "Estética" },
      { id: "maquiagem", label: "Maquiagem" },
    ],
    // Só aparecem no site os itens com published: true.
    items: [
      {
        id: "exemplo-servico",
        name: "EXEMPLO — nome do serviço",
        description: "Descrição curta do serviço (substituir).",
        image: "petala",
        category: "cabelo",
        price: null,
        duration: null,
        published: false,
        whatsappMessage:
          "Olá, Studio Lucia Ferraz! Vim pelo site e gostaria de saber mais sobre [serviço] e consultar a disponibilidade.",
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  reviews: {
    // Resumo do cadastro compartilhado — NÃO é integração ao vivo.
    summary: { rating: 5.0, count: 24, source: "Google Maps", verifiedAt: "2026-11-17", show: true },
    // Ex.: { name, text, rating, source, url, verifiedAt }
    items: [],
  },

  /* ---------------------------------------------------------------------- */
  form: { limits: { name: 80, service: 120, day: 40, notes: 500 } },
};
