# Implementation Plan: Email Authentication and Order History

## Summary

Replace the marketing home with a Supabase email/password authentication screen,
persist authentication through Supabase SSR cookies, link accounts and orders to
`auth.users`, and provide private order history plus frequently ordered drink
combinations.

## Technical Context

- Next.js 16 App Router, React 19, TypeScript
- Supabase Auth, Postgres, `@supabase/ssr`
- Existing `members`, `member_accounts`, and `orders` tables
- Mobile-first responsive UI

## Architecture

- Browser client performs sign-in, sign-up, password reset, and sign-out.
- Server client validates the active Supabase user from cookies.
- `proxy.ts` refreshes authentication cookies.
- `member_accounts.auth_user_id` links auth identity to the existing profile and role.
- `orders.auth_user_id` provides durable private ownership for history.
- Server-side history queries use the validated user ID and return aggregates.

## Security

- Never trust a user ID supplied by the browser.
- Resolve order ownership from the validated server auth session.
- Protect order, account, and barista pages on the server.
- Preserve the service-role key on the server only.
