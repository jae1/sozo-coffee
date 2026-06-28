# Quickstart: Mobile UI Consistency and Usability

## Prerequisites

- Local environment configured with `.env.local`
- Dependencies installed with `npm ci`
- Local dev server running at `http://localhost:3000`
- Test admin account available:
  - Email: `codex-admin-202606280559@sozo.test`
  - Password: `SozoTest-202606280559!`

## Validation Steps

1. Run static checks:

   ```bash
   npm run typecheck
   npm run lint
   ```

2. Start or restart the local app:

   ```bash
   npm run dev
   ```

3. Sign in as the test admin on a phone-sized viewport.

4. Validate ordering:
   - Open `/order`
   - Confirm header is one row
   - Confirm hero title is not clipped
   - Select a drink and temperature
   - Add to order
   - Confirm mobile bottom bar summarizes the order

5. Validate admin:
   - Open `/admin`
   - Confirm header contains only brand and section context
   - Confirm `Back to Account` and `Order coffee` are in the body toolbar
   - Confirm member rows fit the viewport
   - Confirm role changes use segmented buttons, not a native dropdown

6. Validate account:
   - Open `/account`
   - Confirm page actions are in the body toolbar
   - Confirm account summary, favorites, and history use consistent card spacing and type scale

7. Validate barista:
   - Open `/barista`
   - Confirm café open/close action is in the body toolbar
   - Confirm order cards use large one-tap transition buttons on mobile

## Expected Results

- No horizontal overflow at 390px width
- No clipped heading text
- No header wrapping from action buttons
- No native dropdown for admin role changes
- Shared card, button, title, and toolbar language across authenticated pages
