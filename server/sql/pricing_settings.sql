create table if not exists public.pricing_settings (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.pricing_settings (id, data)
values (
  'default',
  '{
    "currency": "USD",
    "rates": {
      "linePerMeter": 0,
      "polylinePerMeter": 0,
      "freeDrawPerMeter": 0,
      "wallPerMeter": 1.2,
      "beamPerMeter": 1.5,
      "lintelPerMeter": 0.8,
      "arcPerMeter": 0,
      "rectanglePerSqMeter": 0,
      "circlePerSqMeter": 0
    }
  }'::jsonb
)
on conflict (id) do nothing;
