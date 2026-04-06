export type ProductCategory = {
  id: string;
  name: string;
  slug: "roupas" | "calçados" | "acessórios";
};

export type ProductImage = {
  id: string;
  url: string;
  position: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  is_active: boolean;
  images: ProductImage[];
  rating_avg: number;
  review_count: number;
};

const categories: Record<ProductCategory["slug"], ProductCategory> = {
  roupas: { id: "cat-roupas", name: "Roupas", slug: "roupas" },
  calçados: { id: "cat-calcados", name: "Calçados", slug: "calçados" },
  acessórios: { id: "cat-acessorios", name: "Acessórios", slug: "acessórios" },
};

function buildImages(seed: string) {
  return [
    {
      id: `${seed}-1`,
      url: `https://picsum.photos/seed/${seed}-1/600/800`,
      position: 0,
    },
    {
      id: `${seed}-2`,
      url: `https://picsum.photos/seed/${seed}-2/600/800`,
      position: 1,
    },
    {
      id: `${seed}-3`,
      url: `https://picsum.photos/seed/${seed}-3/600/800`,
      position: 2,
    },
  ];
}

export const mockProducts: Product[] = [
  {
    id: "vestido-midi-savana",
    name: "Vestido Midi Savana",
    description:
      "Vestido fluido com corte midi, cintura marcada e acabamento leve para produções elegantes no dia a dia.",
    price: 24500,
    category: categories.roupas,
    is_active: true,
    images: buildImages("vestido-midi-savana"),
    rating_avg: 4.8,
    review_count: 18,
  },
  {
    id: "blazer-luna",
    name: "Blazer Luna",
    description:
      "Blazer estruturado com caimento moderno, ideal para compor looks sofisticados com saias, vestidos ou calças.",
    price: 31900,
    category: categories.roupas,
    is_active: true,
    images: buildImages("blazer-luna"),
    rating_avg: 4.7,
    review_count: 11,
  },
  {
    id: "conjunto-sereno",
    name: "Conjunto Sereno",
    description:
      "Conjunto de duas peças em tecido leve com visual minimalista, pensado para conforto e presença.",
    price: 28750,
    category: categories.roupas,
    is_active: true,
    images: buildImages("conjunto-sereno"),
    rating_avg: 4.6,
    review_count: 9,
  },
  {
    id: "camisa-atelier",
    name: "Camisa Atelier",
    description:
      "Camisa feminina de manga comprida com toque acetinado e modelagem versátil para ocasiões formais ou casuais.",
    price: 19800,
    category: categories.roupas,
    is_active: true,
    images: buildImages("camisa-atelier"),
    rating_avg: 4.5,
    review_count: 7,
  },
  {
    id: "sandalia-aura",
    name: "Sandália Aura",
    description:
      "Sandália de salto médio com tiras delicadas e acabamento elegante para elevar qualquer look.",
    price: 22600,
    category: categories.calçados,
    is_active: true,
    images: buildImages("sandalia-aura"),
    rating_avg: 4.9,
    review_count: 23,
  },
  {
    id: "scarpin-noir",
    name: "Scarpin Noir",
    description:
      "Scarpin clássico com biqueira refinada e salto confortável para eventos, trabalho e ocasiões especiais.",
    price: 27400,
    category: categories.calçados,
    is_active: true,
    images: buildImages("scarpin-noir"),
    rating_avg: 4.7,
    review_count: 15,
  },
  {
    id: "tenis-brisa",
    name: "Ténis Brisa",
    description:
      "Ténis feminino com design clean e sola confortável, ideal para looks urbanos com toque contemporâneo.",
    price: 21400,
    category: categories.calçados,
    is_active: true,
    images: buildImages("tenis-brisa"),
    rating_avg: 4.4,
    review_count: 12,
  },
  {
    id: "mule-dourada",
    name: "Mule Dourada",
    description:
      "Mule com acabamento metálico suave, perfeita para combinar praticidade e sofisticação.",
    price: 23800,
    category: categories.calçados,
    is_active: true,
    images: buildImages("mule-dourada"),
    rating_avg: 4.6,
    review_count: 10,
  },
  {
    id: "bolsa-essencia",
    name: "Bolsa Essência",
    description:
      "Bolsa tiracolo de linhas suaves com espaço interno funcional para acompanhar a rotina com estilo.",
    price: 26900,
    category: categories.acessórios,
    is_active: true,
    images: buildImages("bolsa-essencia"),
    rating_avg: 4.8,
    review_count: 21,
  },
  {
    id: "oculos-perola",
    name: "Óculos Pérola",
    description:
      "Óculos femininos com armação marcante e toque glamoroso para complementar produções modernas.",
    price: 16400,
    category: categories.acessórios,
    is_active: true,
    images: buildImages("oculos-perola"),
    rating_avg: 4.3,
    review_count: 8,
  },
  {
    id: "colar-viena",
    name: "Colar Viena",
    description:
      "Colar delicado com brilho subtil, pensado para adicionar elegância a looks minimalistas.",
    price: 9800,
    category: categories.acessórios,
    is_active: true,
    images: buildImages("colar-viena"),
    rating_avg: 4.5,
    review_count: 6,
  },
  {
    id: "relogio-aurora",
    name: "Relógio Aurora",
    description:
      "Relógio feminino com mostrador clean e pulseira refinada para composições clássicas e modernas.",
    price: 35200,
    category: categories.acessórios,
    is_active: true,
    images: buildImages("relogio-aurora"),
    rating_avg: 4.9,
    review_count: 14,
  },
];

export const mockCategories = Object.values(categories);

export function getProductById(id: string) {
  return mockProducts.find((product) => product.id === id);
}
