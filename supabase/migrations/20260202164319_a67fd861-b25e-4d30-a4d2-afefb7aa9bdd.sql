-- Allow admins to read all financial records (needed for admin financial dashboard)

-- Transactions
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Invoices
CREATE POLICY "Admins can view all invoices"
ON public.invoices
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Earnings
CREATE POLICY "Admins can view all earnings"
ON public.earnings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Payouts
CREATE POLICY "Admins can view all payouts"
ON public.payouts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
