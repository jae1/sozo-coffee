# Sozo Coffee

A tiny mobile-first coffee ordering board for a home church.

## Local setup

1. Create a Supabase project.
2. Apply SQL files in `supabase/migrations/` and then `supabase/seed.sql`.
3. Replace placeholder names in `supabase/seed.sql` before production.
4. Copy `.env.example` to `.env.local` and fill the values.
5. Generate a PIN hash:

   ```bash
   node -e "console.log(require('bcryptjs').hashSync('1234', 12))"
   ```

6. Generate a cookie secret:

   ```bash
   openssl rand -base64 32
   ```

7. Run:

   ```bash
   npm install
   npm run dev
   ```

Member ordering is at `/order`; barista controls are at `/barista`.

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `BARISTA_PIN_HASH`, or
`BARISTA_SESSION_SECRET` to browser code.
