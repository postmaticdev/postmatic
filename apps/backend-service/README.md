# Postmatic Backend

Backend API untuk aplikasi Postmatic menggunakan Express.js dan Supabase.

## Teknologi yang Digunakan

- Node.js
- Express.js
- Supabase
- JWT Authentication
- Cloudinary

## Instalasi

1. Clone repository
```bash
git clone https://github.com/haystudio-project/backend.git
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Buat file .env dan isi dengan konfigurasi yang diperlukan:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

BACKEND_PORT=3001
CORS_ORIGIN=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Jalankan server
```bash
# Development
npm run dev

# Production
npm start
```
## lira00
## API Endpoints

- `GET /` - Welcome message
- `GET /test-connection` - Test Supabase connection
- `/api/rss` - RSS Feed Management
  - `GET /api/rss/sources` - Get all RSS sources
  - `GET /api/rss/sources/:sourceId` - Get RSS source by ID
  - `POST /api/rss/sources` - Add new RSS source
  - `PUT /api/rss/sources/:sourceId` - Update RSS source
  - `DELETE /api/rss/sources/:sourceId` - Delete RSS source
  - `PATCH /api/rss/sources/:sourceId/toggle` - Toggle source active status
  - `POST /api/rss/fetch-all` - Fetch articles from all active sources
  - `POST /api/rss/fetch/:sourceId` - Fetch articles from a specific source
- `/api/rss` - News Articles and Tags
  - `GET /api/rss/articles` - Get all news articles with their tags
  - `GET /api/rss/tags` - Get all tags
  - `GET /api/rss/articles/tag/:tagName` - Get articles by tag
  - `DELETE /api/rss/articles/:articleId` - Delete news article by ID

## Testing dengan Postman

1. Import Collection
   - Buka Postman
   - Klik tombol "Import" di pojok kiri atas
   - Pilih file `postman_collection.json` dari folder project
   - Collection akan muncul di sidebar dengan nama "Postmatic Backend API"

2. Endpoint yang Tersedia
   - `GET http://localhost:3001/`
     - Response: `{ "message": "Welcome to Postmatic API" }`
   
   - `GET http://localhost:3001/test-connection`
     - Response: `{ "status": "connected", "message": "Successfully connected to Supabase" }`

   - `/api/rss` - RSS Feed Management
     - `GET /api/rss/sources` - Get all RSS sources
     - `GET /api/rss/sources/:sourceId` - Get RSS source by ID
     - `POST /api/rss/sources` - Add new RSS source
     - `PUT /api/rss/sources/:sourceId` - Update RSS source
     - `DELETE /api/rss/sources/:sourceId` - Delete RSS source
     - `PATCH /api/rss/sources/:sourceId/toggle` - Toggle source active status
     - `POST /api/rss/fetch-all` - Fetch articles from all active sources
     - `POST /api/rss/fetch/:sourceId` - Fetch articles from a specific source
   - `/api/rss` - News Articles and Tags
     - `GET /api/rss/articles` - Get all news articles with their tags
     - `GET /api/rss/tags` - Get all tags
     - `GET /api/rss/articles/tag/:tagName` - Get articles by tag
     - `DELETE /api/rss/articles/:articleId` - Delete news article by ID
   - `/api/product-knowledge` - Product Knowledge Management
      - `GET /api/product-knowledge` - Get all products
      - `GET /api/product-knowledge/:productId` - Get product by ID
      - `POST /api/product-knowledge` - Add new product
      - `PUT /api/product-knowledge/:productId` - Update product
      - `DELETE /api/product-knowledge/:productId` - Delete product
   - `/api/business` - Business Knowledge Management
      - `GET /api/business` - Mendapatkan semua data bisnis
      - `GET /api/business/:id` - Mendapatkan data bisnis berdasarkan ID
      - `GET /api/business/category/:category` - Mendapatkan data bisnis berdasarkan kategori
      - `POST /api/business` - Menambahkan data bisnis baru
      - `PUT /api/business/:id` - Memperbarui data bisnis
      - `DELETE /api/business/:id` - Menghapus data bisnis
    - `/api/upload-cloudinary` - Upload Gambar ke Cloudinary
      - `POST /api/upload-cloudinary/single` - Upload satu gambar (form-data, key: `image`)
      - `POST /api/upload-cloudinary/multiple` - Upload beberapa gambar (form-data, key: `images`, max 10)
      - `DELETE /api/upload-cloudinary/:imageUrl` - Hapus gambar berdasarkan URL

3. Cara Penggunaan
   - Pastikan server backend berjalan (`npm run dev`)
   - Pilih endpoint yang ingin diuji di collection
   - Klik tombol "Send" untuk mengirim request
   - Lihat response di tab "Response"

## Struktur Folder

```
backend/
├── config/         # Konfigurasi (Supabase, dll)
├── controllers/    # Logic handler
├── routes/         # API routes
├── middleware/     # Custom middleware
└── index.js        # Entry point
``` 

## Konfigurasi CORS

Backend dikonfigurasi untuk menerima request dari frontend yang berjalan di `http://localhost:3000`. Jika Anda menjalankan frontend di BACKEND_PORT atau domain yang berbeda, sesuaikan nilai `CORS_ORIGIN` di file `.env`.

