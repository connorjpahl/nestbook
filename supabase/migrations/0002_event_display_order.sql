-- Manual tiebreaker for events that share the same event_date. event_date
-- alone can't express "which of these two same-day moments came first,"
-- and falling back to created_at only reflects upload order, not the
-- order a family actually wants to tell the story in. This column is null
-- until someone uses the reorder controls, at which point it's assigned a
-- concrete integer among that day's siblings.
alter table public.events add column display_order integer;
