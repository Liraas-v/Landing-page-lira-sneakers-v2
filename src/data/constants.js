export const SERVICOS = [
  {
    id: 1,
    titulo: "Limpeza Completa",
    desc: "Externa, interna, sola, palmilhas, cadarços e odores.",
    categoria: "Limpeza",
    preco: 70,
  },
  {
    id: 2,
    titulo: "Limpeza Premium (Grife)",
    desc: "Cuidado especializado para itens de luxo.",
    categoria: "Limpeza",
    preco: 100,
  },
  {
    id: 3,
    titulo: "Limpeza de Bonés",
    desc: "Higienização mantendo o formato original.",
    categoria: "Limpeza",
    preco: 40,
  },
  {
    id: 4,
    titulo: "Pintura Entressola",
    desc: "Restauração da cor da midsole.",
    categoria: "Pintura",
    preco: 90,
  },
  {
    id: 5,
    titulo: "Pintura de Cabedal",
    desc: "Renovação completa da cor superior.",
    categoria: "Pintura",
    preco: 100,
  },
  {
    id: 6,
    titulo: "Restauração de Camurça",
    desc: "Recuperação de textura e cor.",
    categoria: "Couro",
    preco: 70,
  },
  {
    id: 7,
    titulo: "Hidratação de Camurça",
    desc: "Nutrição profunda para suede.",
    categoria: "Couro",
    preco: 50,
  },
  {
    id: 8,
    titulo: "Hidratação do Couro",
    desc: "Evita rachaduras e mantém brilho.",
    categoria: "Couro",
    preco: 30,
  },
  {
    id: 9,
    titulo: "Colagem",
    desc: "Reparo estrutural com cola profissional.",
    categoria: "Reparo",
    preco: 60,
  },
  {
    id: 10,
    titulo: "Impermeabilização",
    desc: "Proteção contra líquidos e manchas.",
    categoria: "Proteção",
    preco: 35,
  },
];

export const TAXA_URGENCIA = {
  desc: "Entrega prioritária em 24h para qualquer serviço acima, sujeita à disponibilidade.",
  preco: 30,
};

export const FAQ_ITEMS = [
  {
    id: "f1",
    pergunta: "Quanto tempo leva a limpeza completa?",
    resposta:
      "A limpeza completa leva em média 3 a 5 dias úteis. Temos a opção de urgência com entrega em 24h mediante taxa adicional.",
  },
  {
    id: "f2",
    pergunta: "Vocês fazem coleta e entrega?",
    resposta:
      "Sim! Fazemos coleta e entrega em São Paulo e Regiões. Entre em contato pelo WhatsApp para verificar disponibilidade na sua região.",
  },
  {
    id: "f3",
    pergunta: "Como solicito um orçamento?",
    resposta:
      "É simples! Clique em qualquer botão de orçamento na página e você será direcionado ao nosso WhatsApp. Basta enviar fotos do seu tênis.",
  },
  {
    id: "f4",
    pergunta: "Atendem tênis de grife e luxo?",
    resposta:
      "Com certeza! Temos serviço especial para Balenciaga, Yeezy, Louis Vuitton e outros.",
  },
  {
    id: "f5",
    pergunta: "Os valores mostrados são definitivos?",
    resposta:
      "Os valores são estimativas. O valor final é confirmado após avaliação do estado do tênis.",
  },
  {
    id: "f6",
    pergunta: "Como acompanho meu serviço em andamento?",
    resposta:
      "Atualizamos você por WhatsApp em cada etapa do processo, desde a chegada do tênis até a entrega.",
  },
  {
    id: "f7",
    pergunta: "E se algo der errado com o meu tênis durante o processo?",
    resposta:
      "Cada par passa por uma avaliação antes de iniciarmos qualquer serviço, e fotografamos o estado inicial. Se identificarmos um risco específico do material (ex. couro muito desgastado, colas antigas), avisamos antes de prosseguir. Qualquer problema é comunicado imediatamente pelo WhatsApp — não escondemos.",
  },
];

export const WHATSAPP_NUMBER = "5511930733933";

export const PRAZOS = {
  "Limpeza Completa": "3 a 5 dias úteis",
  "Limpeza Premium (Grife)": "5 a 7 dias úteis",
  "Limpeza de Bonés": "2 a 3 dias úteis",
  "Pintura Entressola": "5 a 7 dias úteis",
  "Pintura de Cabedal": "7 a 10 dias úteis",
  "Restauração de Camurça": "5 a 7 dias úteis",
  "Hidratação de Camurça": "2 a 3 dias úteis",
  "Hidratação do Couro": "2 a 3 dias úteis",
  Colagem: "3 a 5 dias úteis",
  Impermeabilização: "1 a 2 dias úteis",
  "Taxa de Urgência": "24 horas",
};

export const DEPOIMENTOS = [
  {
    id: "d1",
    nome: "Cliente Lira Sneakers",
    cidade: "São Paulo, SP",
    texto: "Que trabalho incrível! Muito obrigada, ficou perfeito.",
    servico: "Limpeza Completa",
    nota: 5,
    inicial: "L",
    print: "/depoimentos/print-01.webp",
  },
  {
    id: "d2",
    nome: "Cliente Lira Sneakers",
    cidade: "São Paulo, SP",
    texto: "Slk irmão, você é fera! Parece que acabei de comprar. Trampo foda.",
    servico: "Limpeza Premium (Grife)",
    nota: 5,
    inicial: "L",
    print: "/depoimentos/print-02.webp",
  },
  {
    id: "d3",
    nome: "Enzo",
    cidade: "São Paulo, SP",
    texto: "Ficou zero! Você é zika, mano.",
    servico: "Limpeza Completa",
    nota: 5,
    inicial: "E",
    print: "/depoimentos/print-03.webp",
  },
  {
    id: "d4",
    nome: "Fêrnanda A.",
    cidade: "São Paulo, SP",
    texto: "Ficaram perfeitos! Eu amei. Gratidão por tanto capricho e cuidado.",
    servico: "Limpeza Premium (Grife)",
    nota: 5,
    inicial: "F",
    print: "/depoimentos/print-04.webp",
  },
];

export const LOCATION = {
  cidade: "São Paulo",
  estado: "SP",
  bairro: "Limão",
  endereco: "Av. Inajar de Souza, 3947",
  cep: "02717-000",
  descricao:
    "Atendemos São Paulo e Regiões. Entre em contato pelo WhatsApp para verificar coleta e entrega na sua área.",
  raio: "São Paulo e Regiões",
  horarios: [
    { dia: "Segunda a Sexta", hora: "8h às 18h" },
    { dia: "Sábado", hora: "8h às 18h" },
    { dia: "Domingo", hora: "8h às 12h" },
  ],
  googleMaps:
    "https://www.google.com/maps/search/?api=1&query=Av.%20Inajar%20de%20Souza%2C%203947%20-%20Lim%C3%A3o%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2002717-000",
};

export const NUMEROS = [
  { valor: "500+", label: "Pares restaurados" },
  { valor: "4.9★", label: "Nota média" },
  { valor: "3 dias", label: "Prazo médio" },
  { valor: "100%", label: "Satisfação garantida" },
];

export const HERO_BENEFICIO = "Devolvemos a vida ao seu tênis em até 3 dias.";
