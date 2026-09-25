ALTER TABLE "obras"
    ADD COLUMN IF NOT EXISTS "dimensiones" TEXT NOT NULL DEFAULT 'No especificadas';