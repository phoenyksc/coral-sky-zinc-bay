-- House administrators and two-factor settings. Secrets never leave the server
-- except the one-time authenticator setup key.

create table if not exists admin_members (
  user_id text primary key,
  email text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists security_settings (
  user_id text primary key,
  phone text not null default '',
  sms_enabled boolean not null default false,
  totp_enabled boolean not null default false,
  totp_secret text not null default '',
  totp_pending boolean not null default false,
  last_sms_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists security_sms_codes (
  id text primary key,
  user_id text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists security_sms_codes_user_id_idx on security_sms_codes (user_id);
