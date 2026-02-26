-- Add materials_url column to academy_content table
-- Allows attaching supplementary documents (PDFs, slides, etc.) to academy content
ALTER TABLE academy_content ADD COLUMN materials_url TEXT;
