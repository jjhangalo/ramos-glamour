export async function GET() {
  const content = `# Ramos Glamour
Ramos Glamour é uma boutique de luxo sediada em Luanda, Angola, focada em moda feminina e acessórios de alta qualidade. A marca destaca-se pela curadoria de peças que combinam elegância clássica com tendências contemporâneas.

## Contexto
Plataforma de e-commerce especializada no mercado angolano. O catálogo inclui vestuário feminino, malas, calçado e acessórios sofisticados.

## Estrutura de URLs
- **Página Inicial**: /
- **Catálogo Geral**: /catalogo
- **Produtos**: /produtos/[slug] - Páginas de detalhe de cada peça com especificações técnicas e imagens.
- **Categorias**: /categorias/[slug] - Listagem de produtos filtrada por tipo de peça ou coleção.
- **Novidades**: /novidades - Últimos lançamentos do inventário.
- **Empresa**: /empresa - Informações sobre a marca e manifesto.
- **Contacto**: /contacto - Canais de suporte e localização.

## Dados Técnicos
- **Moeda**: Kwanza (AOA).
- **Pagamentos**: Suporte a pagamentos locais e transferências.
- **Logística**: Entregas em domicílio em toda a província de Luanda.
- **Stock**: Inventário atualizado em tempo real.

Sitemap: https://ramosglamour.com/sitemap.xml`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
