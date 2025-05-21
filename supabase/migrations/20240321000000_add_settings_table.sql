-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL DEFAULT 'Daily Orders',
    store_description TEXT NOT NULL DEFAULT 'Fresh groceries delivered to your doorstep daily.',
    contact_email VARCHAR(255) NOT NULL DEFAULT 'contact@dailyorders.com',
    contact_phone VARCHAR(20) NOT NULL DEFAULT '123-456-7890',
    enable_order_notifications BOOLEAN NOT NULL DEFAULT true,
    enable_sms BOOLEAN NOT NULL DEFAULT false,
    delivery_radius NUMERIC(10,2) NOT NULL DEFAULT 10,
    min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 10,
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 2.99,
    free_delivery_threshold NUMERIC(10,2) NOT NULL DEFAULT 40,
    enable_delivery_tracking BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default settings
INSERT INTO public.settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for settings table
CREATE TRIGGER handle_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 