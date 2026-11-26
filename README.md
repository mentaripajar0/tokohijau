# TokoHijau

Toko produk digital otomatis dengan Google SSO dan pembayaran QRIS Dinamis, dibangun di atas **Astro SSR + React + Hono + Cloudflare Workers & D1**.

## Struktur Proyek

```text
apps/web/   Website TokoHijau (Storefront User + Panel Admin + Hono API)
```

## Menjalankan Secara Lokal

```bash
npm install
cp apps/web/.dev.vars.example apps/web/.dev.vars
npm run dev
```

## Perintah Utama

- `npm run dev` — Jalankan server pengembangan Astro (`http://localhost:4321`)
- `npm run build` — Build produksi untuk Cloudflare Workers
- `npm run check` — Cek tipe TypeScript & Astro
- `npm test` — Jalankan pengujian otomatis (Vitest)
- `npm run deploy` — Build & deploy ke Cloudflare Workers
