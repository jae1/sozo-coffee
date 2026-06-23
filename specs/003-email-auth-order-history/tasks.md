# Tasks: Email Authentication and Order History

- [x] T001 Add auth identity and order ownership migration in `supabase/migrations/006_email_auth_history.sql`
- [x] T002 Add Supabase server and proxy clients in `src/lib/supabase/server.ts`, `src/lib/supabase/proxy.ts`, and `src/proxy.ts`
- [x] T003 Replace custom member session reads with Supabase profile sessions in `src/lib/auth/member-session.ts`
- [x] T004 Implement email sign-in, sign-up, reset, and sign-out UI in `src/components/account/login-page-experience.tsx`
- [x] T005 Replace `/` with the authentication experience in `src/app/page.tsx`
- [x] T006 Protect and simplify authenticated ordering in `src/app/order/page.tsx` and `src/components/order/order-experience.tsx`
- [x] T007 Persist authenticated ownership in `src/app/api/orders/route.ts` and `src/lib/orders/create-order.ts`
- [x] T008 Add private history query in `src/lib/orders/get-order-history.ts`
- [x] T009 Build account history and frequent orders UI in `src/app/account/page.tsx` and `src/components/account/account-experience.tsx`
- [x] T010 Validate migrations, lint, types, tests, build, and mobile browser flows
