
CREATE TABLE public.withdrawal_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  withdrawal_id uuid REFERENCES public.withdrawals(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  admin_response text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.withdrawal_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports" ON public.withdrawal_reports
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own reports" ON public.withdrawal_reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all reports" ON public.withdrawal_reports
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
