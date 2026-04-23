-- Adiciona parent_id à tabela categories
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES categories(id) ON DELETE SET NULL;

-- Cria tabela de junção produto-categoria
CREATE TABLE IF NOT EXISTS product_categories (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "product_categories_read" ON product_categories
  FOR SELECT TO anon, authenticated USING (true);

-- Escrita apenas service_role
CREATE POLICY "product_categories_write" ON product_categories
  FOR ALL TO service_role USING (true);
