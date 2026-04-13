-- PostgreSQL Search Overhaul Setup (v2: with English stemming support)
-- This script enables Full Text Search (FTS) and Trigram fuzzy matching.

-- 1. Enable Extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create Trigger Function
-- Uses 'english' config for title/description (enables stemming: shoe -> shoes).
-- Uses 'simple' config for tags (preserves exact values).
-- Weights: A (Title), B (Tags), C (Description).
CREATE OR REPLACE FUNCTION cached_products_search_vector_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', array_to_string(NEW.ai_tags, ' ')), 'B') ||
    setweight(to_tsvector('simple', lower(array_to_string(NEW.tags, ' '))), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach Trigger
DROP TRIGGER IF EXISTS cached_products_search_vector_trigger ON cached_products;
CREATE TRIGGER cached_products_search_vector_trigger
  BEFORE INSERT OR UPDATE
  ON cached_products
  FOR EACH ROW
  EXECUTE FUNCTION cached_products_search_vector_update();

-- 4. Create GIN Indexes
-- search_vector_gin: Fast Full Text Search ranking
CREATE INDEX IF NOT EXISTS cached_products_search_vector_gin 
  ON cached_products USING GIN(search_vector);
  
-- title_trgm_gin: Fast fuzzy matching for typos/brand fragments
CREATE INDEX IF NOT EXISTS cached_products_title_trgm_gin 
  ON cached_products USING GIN(title gin_trgm_ops);

-- 5. Backfill existing data
-- This UPDATE forces the trigger to fire for all existing rows.
UPDATE cached_products SET search_vector = NULL;
