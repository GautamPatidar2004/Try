## Backfill message threads for previously approved brand campaign applications

Run a one-time data backfill (via the insert tool) that creates an initial brand→creator message for every `brand_campaign_applications` row where `status = 'accepted'` and no message currently exists for that `application_id`.

### SQL

```sql
INSERT INTO public.messages (sender_id, receiver_id, application_id, content, created_at)
SELECT
  c.created_by                                AS sender_id,
  a.influencer_id                             AS receiver_id,
  a.id                                        AS application_id,
  'Great news — your application for "' || COALESCE(c.campaign_title, 'your campaign')
    || '" has been accepted! Let''s coordinate next steps here.' AS content,
  COALESCE(a.reviewed_at, now())              AS created_at
FROM public.brand_campaign_applications a
JOIN public.brand_campaigns c ON c.id = a.campaign_id
WHERE a.status = 'accepted'
  AND c.created_by IS NOT NULL
  AND a.influencer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.messages m WHERE m.application_id = a.id
  );
```

Idempotent: the `NOT EXISTS` guard means re-running won't duplicate.

### Out of scope

- No schema changes.
- No notifications/emails for the backfilled messages (would spam users about old approvals).
