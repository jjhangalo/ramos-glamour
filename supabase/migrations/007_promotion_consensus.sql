-- Tabela para rastrear o pedido de promoção
CREATE TABLE IF NOT EXISTS public.promotion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.profiles(id),
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela para rastrear os votos individuais dos administradores
CREATE TABLE IF NOT EXISTS public.promotion_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.promotion_requests(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES public.profiles(id),
    decision TEXT NOT NULL, -- 'approve', 'reject'
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(request_id, voter_id) -- Um administrador só vota uma vez por pedido
);

-- Políticas de Segurança (RLS)
ALTER TABLE public.promotion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_votes ENABLE ROW LEVEL SECURITY;

-- Apenas administradores podem ver e interagir com estas tabelas
CREATE POLICY "Admins can view requests" ON public.promotion_requests 
FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can create requests" ON public.promotion_requests 
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update their own requests" ON public.promotion_requests 
FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can view votes" ON public.promotion_votes 
FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can vote" ON public.promotion_votes 
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
