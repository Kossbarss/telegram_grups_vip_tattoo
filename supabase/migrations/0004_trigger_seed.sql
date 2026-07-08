-- Auto-provision a profile (and, for masters, default settings +
-- calculator options) whenever a new auth.users row is created.
-- Role and display info come from the invite's user_metadata, set by
-- admin.auth.admin.inviteUserByEmail() in the provisioning server action.

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, role, display_name, business_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'master'),
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'business_name'
  );

  if coalesce(new.raw_user_meta_data ->> 'role', 'master') = 'master' then
    insert into master_settings (master_id) values (new.id);

    insert into calculator_options (master_id, category, label, multiplier, sort_order) values
      (new.id, 'size', 'Маленьке (до 5 см)', 0.7, 1),
      (new.id, 'size', 'Середнє (5-15 см)', 1.0, 2),
      (new.id, 'size', 'Велике (понад 15 см)', 1.6, 3),
      (new.id, 'style', 'Лайнворк', 1.0, 1),
      (new.id, 'style', 'Реалізм', 1.4, 2),
      (new.id, 'style', 'Традишнл', 1.1, 3),
      (new.id, 'color_complexity', 'Чорно-біле', 1.0, 1),
      (new.id, 'color_complexity', 'Кольорове', 1.3, 2);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
