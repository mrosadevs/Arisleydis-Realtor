# Arisleydis Realtor Website (Framer Replacement)

This project is a fully editable replacement for the current Framer site, with:

- animated/parallax homepage
- responsive layout from mobile to ultrawide
- property detail pages
- secure admin portal for creating, editing, deleting listings
- image upload support for listing galleries
- listing statuses including `For Sale`, `For Rent`, `Under Contract`, and `Sold`

## Tech Stack

- Next.js (App Router)
- TypeScript
- File-based data storage (`data/properties.json`)
- Uploaded images saved to `public/uploads`

## 1) Install

```bash
npm install
```

## 2) Configure admin login

Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

Then set:

- `ADMIN_PASSWORD` (password used at `/admin`)
- `ADMIN_SECRET` (random secret for session cookie signing)
- `ADMIN_TOTP_SECRET` (optional, base32 secret to require authenticator-app 2FA)

## 3) Run locally

```bash
npm run dev
```

Open:

- Homepage: `http://localhost:3000`
- Admin portal (hidden from nav): `http://localhost:3000/admin`

## 2FA setup (recommended)

If you set `ADMIN_TOTP_SECRET`, login requires:

1. Admin password
2. 6-digit authenticator code (Google Authenticator/Authy/1Password)

The login route also includes brute-force lockout after repeated failed attempts.
On the `/admin` login screen, click `Generate Authenticator QR` after entering the password to scan setup directly.
Note: QR rendering uses a public QR image endpoint, so for maximum secrecy use a private QR generator in production.

You can generate a base32 secret with:

```bash
node -e "const a='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';console.log(Array.from({length:32},()=>a[Math.floor(Math.random()*a.length)]).join(''))"
```

## Admin workflow

1. Log in at `/admin`
2. Create or edit listings
3. Upload images or paste image URLs
4. Delete listings as needed

All listing data is stored in `data/properties.json`.

## Production notes

- For best persistence in production, keep `data/` and `public/uploads/` on persistent disk (or switch to a database + cloud storage).
- If deploying to a serverless platform, file writes may not persist between deployments. In that case, migrate `property-store.ts` to a DB.
