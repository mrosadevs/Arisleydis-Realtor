# 🏡 Arisleydis Cruz — Luxury Florida Real Estate

### Your Trusted Realtor in Florida

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Auth](https://img.shields.io/badge/Admin-2FA%20Protected-10b981?style=for-the-badge)

**A fully editable luxury real estate website with animated homepage, property listings, and a secure admin portal — built as a Framer replacement.**

[🌐 Live Site](https://arisleydisrealtor.com)

</div>

---

## ✨ Features

- 🎬 **Animated Homepage** — Parallax effects and smooth scroll animations
- 🏠 **Property Listings** — Browse properties with status badges (For Sale, For Rent, Under Contract, Sold)
- 📄 **Property Detail Pages** — Full gallery, description, features, and contact CTA
- 🔐 **Secure Admin Portal** — Hidden from nav, password + optional TOTP 2FA
- 🖼️ **Image Upload** — Upload photos or paste image URLs for listing galleries
- ✏️ **Full CRUD** — Create, edit, and delete listings from the admin panel
- 🛡️ **Brute-Force Protection** — Lockout after repeated failed login attempts
- 📱 **Fully Responsive** — Mobile to ultrawide with elegant typography
- 🖼️ **Dynamic OG Image** — Auto-generated social preview banner via `next/og`

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| ⚛️ Framework | Next.js 14 (App Router) |
| 🟦 Language | TypeScript |
| 🎨 Fonts | Playfair Display (headings) + Inter (body) via `next/font` |
| 🗄️ Data | File-based JSON (`data/properties.json`) |
| 🖼️ Uploads | Saved to `public/uploads/` |
| 🔐 Auth | Password + TOTP 2FA (Google Authenticator / Authy) |

---

## 🚀 Getting Started

### 1️⃣ Install

```bash
npm install
```

### 2️⃣ Configure Admin Login

```bash
cp .env.example .env.local
```

Set the following in `.env.local`:

| Variable | Description |
|----------|-------------|
| `ADMIN_PASSWORD` | Password for `/admin` login |
| `ADMIN_SECRET` | Random secret for session cookie signing |
| `ADMIN_TOTP_SECRET` | *(Optional)* Base32 secret for 2FA |

### 3️⃣ Run Locally

```bash
npm run dev
```

| Page | URL |
|------|-----|
| 🏠 Homepage | [http://localhost:3000](http://localhost:3000) |
| 🔐 Admin | [http://localhost:3000/admin](http://localhost:3000/admin) |

---

## 🔐 2FA Setup (Recommended)

If you set `ADMIN_TOTP_SECRET`, login requires:

1. ✅ Admin password
2. ✅ 6-digit authenticator code (Google Authenticator / Authy / 1Password)

Generate a base32 secret:

```bash
node -e "const a='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';console.log(Array.from({length:32},()=>a[Math.floor(Math.random()*a.length)]).join(''))"
```

> 💡 On the `/admin` login screen, click **"Generate Authenticator QR"** after entering the password to scan setup directly.

---

## 🔧 Admin Workflow

1. 🔑 Log in at `/admin`
2. ➕ Create or ✏️ edit listings
3. 🖼️ Upload images or paste image URLs
4. 🗑️ Delete listings as needed

All data is stored in `data/properties.json`.

---

## 📂 Project Structure

```
Arisleydis-Realtor-Website/
├── app/
│   ├── layout.tsx                  # Root layout + metadata
│   ├── page.tsx                    # Homepage
│   ├── opengraph-image.tsx         # Dynamic OG banner
│   ├── properties/
│   │   └── [slug]/page.tsx         # Property detail page
│   └── admin/                      # Admin portal (login + CRUD)
├── components/
│   └── SiteHeader.tsx              # Navigation header
├── data/
│   └── properties.json             # Property listings data
├── public/
│   └── uploads/                    # Uploaded listing images
├── .env.example                    # Environment template
└── package.json
```

---

## 🚢 Production Notes

- 💾 Keep `data/` and `public/uploads/` on **persistent disk** for reliable storage
- ☁️ If deploying to serverless (Vercel, etc.), migrate `property-store.ts` to a **database + cloud storage** — file writes don't persist between deployments
- 🔒 For max security, use a private QR generator instead of the public endpoint for TOTP setup

---

<div align="center">

🏡 **Find your dream home in Florida** 🌴

</div>
