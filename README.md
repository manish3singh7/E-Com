# Kaarigar: full-stack e-commerce (React + Node + MongoDB)

Stack: React + Vite, Tailwind CSS, Redux Toolkit, React Router, Node/Express, MongoDB/Mongoose, JWT in HTTP-only cookies, Razorpay, Cloudinary.

## Run locally
1. Start MongoDB (local or Atlas) and create accounts for Razorpay (test mode) and Cloudinary.
2. Backend: `cd backend && cp .env.example .env` (fill it in), then `npm install && npm run seed && npm run dev`
3. Frontend: `cd frontend && cp .env.example .env && npm install && npm run dev`
4. Open http://localhost:5173. Admin login after seeding: admin@kaarigar.test / Admin@12345 (change it).

## Deploy
Frontend on Vercel (set VITE_API_URL), backend on Render/Railway (set every variable from .env.example plus NODE_ENV=production, CLIENT_URL = your Vercel URL), database on MongoDB Atlas.

## API
Auth: POST /api/auth/register, login, logout, forgot-password, reset-password/:token; GET /api/auth/me
Products: GET/POST /api/products; GET/PUT/DELETE /api/products/:id; POST /api/products/:id/reviews
Cart: GET/POST /api/cart; PUT/DELETE /api/cart/:id. Wishlist: GET /api/wishlist; POST /api/wishlist/:id
Orders: POST/GET /api/orders; GET /api/orders/:id. Payments: POST /api/payments/verify
Admin: GET /api/admin/stats, users, coupons; PUT /api/orders/:id/status; POST /api/upload

## Not built yet
Email sending (reset link is printed in the server console), shadcn/ui, Socket.IO, automated tests, a Postman collection.
