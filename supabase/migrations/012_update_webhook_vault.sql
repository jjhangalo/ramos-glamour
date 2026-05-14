CREATE OR REPLACE FUNCTION public.notify_new_admin()
RETURNS TRIGGER AS $$
DECLARE
  v_secret text;
BEGIN
  -- Try to extract the secret from Supabase Vault
  SELECT secret INTO v_secret FROM vault.decrypted_secrets WHERE name = 'webhook_secret' LIMIT 1;
  
  IF v_secret IS NULL THEN
    RAISE WARNING 'Webhook secret not found in Supabase Vault';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := 'https://admin.ramosglamour.com/api/webhooks/admin-created',
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_secret
    )::jsonb,
    body := json_build_object('record', row_to_json(NEW))::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
