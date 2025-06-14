
-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for property types
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'commercial', 'land');

-- Create enum for property status
CREATE TYPE property_status AS ENUM ('available', 'sold', 'rented');

-- Create properties table
CREATE TABLE public.properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type property_type NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  area DECIMAL(10,2) NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  status property_status DEFAULT 'available',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property images table
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true);

-- Create storage policies for property images bucket
CREATE POLICY "Anyone can view property images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Anyone can upload property images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Anyone can update property images" ON storage.objects
FOR UPDATE USING (bucket_id = 'property-images');

CREATE POLICY "Anyone can delete property images" ON storage.objects
FOR DELETE USING (bucket_id = 'property-images');

-- Create leads table for tracking client origins
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT NOT NULL, -- 'OLX', 'ZAP Imóveis', 'Viva Real', 'Facebook', 'Google Ads', etc.
  property_id TEXT REFERENCES public.properties(id),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for properties table
CREATE TRIGGER update_properties_updated_at 
BEFORE UPDATE ON public.properties 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a real estate app, properties should be publicly viewable)
CREATE POLICY "Anyone can view properties" ON public.properties
FOR SELECT USING (true);

CREATE POLICY "Anyone can create properties" ON public.properties
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update properties" ON public.properties
FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete properties" ON public.properties
FOR DELETE USING (true);

CREATE POLICY "Anyone can view property images" ON public.property_images
FOR SELECT USING (true);

CREATE POLICY "Anyone can create property images" ON public.property_images
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update property images" ON public.property_images
FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete property images" ON public.property_images
FOR DELETE USING (true);

CREATE POLICY "Anyone can view leads" ON public.leads
FOR SELECT USING (true);

CREATE POLICY "Anyone can create leads" ON public.leads
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update leads" ON public.leads
FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete leads" ON public.leads
FOR DELETE USING (true);

-- Insert some sample data
INSERT INTO public.properties (id, title, type, price, area, bedrooms, bathrooms, address, city, state, status, description) VALUES
('CASA001', 'Casa Moderna em Condomínio', 'house', 850000.00, 250.00, 4, 3, 'Rua das Flores, 123', 'São Paulo', 'SP', 'available', 'Belíssima casa em condomínio fechado com área de lazer completa.'),
('APT001', 'Apartamento no Centro', 'apartment', 450000.00, 85.00, 2, 2, 'Av. Paulista, 1000', 'São Paulo', 'SP', 'rented', 'Apartamento moderno com vista para a cidade.'),
('TERRENO001', 'Terreno Comercial', 'land', 1200000.00, 500.00, null, null, 'Rua Comercial, 456', 'São Paulo', 'SP', 'available', 'Excelente terreno para empreendimento comercial.');

-- Insert sample leads data for dashboard
INSERT INTO public.leads (name, email, phone, source, message, property_id) VALUES
('João Silva', 'joao@email.com', '(11) 99999-9999', 'OLX', 'Interessado em casas', 'CASA001'),
('Maria Santos', 'maria@email.com', '(11) 88888-8888', 'ZAP Imóveis', 'Procuro apartamento', 'APT001'),
('Pedro Costa', 'pedro@email.com', '(11) 77777-7777', 'Viva Real', 'Quero alugar', null),
('Ana Oliveira', 'ana@email.com', '(11) 66666-6666', 'Facebook', 'Primeira compra', null),
('Carlos Souza', 'carlos@email.com', '(11) 55555-5555', 'Google Ads', 'Investimento', null);
