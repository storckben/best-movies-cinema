
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'expired', 'refunded');

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text,
  gateway text NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  amount numeric(10,2) NOT NULL,
  movie_title text NOT NULL,
  seats text,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_cpf text NOT NULL,
  pix_code text,
  paid_at timestamp with time zone,
  webhook_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_transaction_id ON public.orders (transaction_id);
CREATE INDEX idx_orders_status ON public.orders (status);
CREATE INDEX idx_orders_created_at ON public.orders (created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read orders"
ON public.orders FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can insert orders"
ON public.orders FOR INSERT TO public WITH CHECK (true);

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
