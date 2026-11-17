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
  // price: null = "Sob consulta". colors: [brilho, fundo, destaque]
  // watermark: palavra gigante atrás do produto no topo.
  productCategories: [
    { id: "moments", label: "Moments Paris" },
    { id: "fios", label: "Fios Hidratados" },
  ],
  products: [
    {
      id: "moments-mask",
      name: "Moments Mask",
      type: "Máscara hidratante",
      brand: "Moments Paris",
      category: "moments",
      image: "Assets/Produtos/Mascara de Cabelo - sem fundo.png",
      description: "Máscara hidratante da linha Moments Paris. Peça com a consultora e consulte valor e disponibilidade.",
      watermark: "MOMENTS",
      colors: ["#d9b46a", "#120d06", "#f6e2b3"],
      price: "R$ 89,90", // FICTÍCIO
      published: true,
    },
    {
      id: "moments-condicionador",
      name: "Condicionador Moments",
      type: "Condicionador",
      brand: "Moments Paris",
      category: "moments",
      image: "Assets/Produtos/Condicionador - sem fundo.png",
      description: "Condicionador da linha Moments Paris. Consulte valor, versões e disponibilidade pelo WhatsApp.",
      watermark: "PARIS",
      colors: ["#2bb8a3", "#04110f", "#a8f0e2"],
      price: "R$ 69,90", // FICTÍCIO
      published: true,
    },
    {
      id: "fios-condicionador",
      name: "Fios Hidratados nº 2",
      type: "Condicionador · 2,5 L",
      brand: "Chanceller",
      category: "fios",
      image: "Assets/Produtos/Condicionador (2) - sem fundo.png",
      description: "Condicionador Fios Hidratados em embalagem de 2,5 L. Consulte valor e disponibilidade.",
      watermark: "FIOS",
      colors: ["#e8c79a", "#140e08", "#fff1da"],
      price: "R$ 129,90", // FICTÍCIO
      published: true,
    },
    {
      id: "fios-shampoo",
      name: "Shampoo Fios Hidratados",
      type: "Shampoo",
      brand: null, // marca a confirmar
      category: "fios",
      image: "Assets/Produtos/Shampoo - sem fundo.png",
      description: "Shampoo da linha Fios Hidratados. Consulte valor e disponibilidade pelo WhatsApp.",
      watermark: "DIVA",
      colors: ["#ff4f9a", "#14040b", "#ffc2dc"],
      price: "R$ 59,90", // FICTÍCIO
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
