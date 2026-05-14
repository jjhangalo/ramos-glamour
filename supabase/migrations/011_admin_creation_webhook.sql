CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_new_admin()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://admin.ramosglamour.com/api/webhooks/admin-created',
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.webhook_secret', true)
    )::jsonb,
    body := json_build_object('record', row_to_json(NEW))::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_admin_created ON public.profiles;
CREATE TRIGGER on_admin_created
AFTER INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.role = 'admin')
EXECUTE FUNCTION public.notify_new_admin();
