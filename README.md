# TechZone50 - Gjirafa50 Clone - Modern E-Commerce Experience

TechZone50 - Gjirafa50 Clone is a full-stack e-commerce web application inspired by the Gjirafa50 platform. It delivers a modern online shopping experience with product browsing, secure payments, user authentication, and an intuitive admin dashboard for managing products and orders.
Built with a scalable architecture, this project demonstrates real-world e-commerce functionality using modern web technologies.


## Features

- Browse and search products with filters and categories  
- View detailed product pages with images and descriptions
- Purchase various amounts of gift cards
- Add products to cart and manage quantities  
- Secure checkout and payment integration  
- User authentication and profile management  
- Order history and tracking for users  
- Admin dashboard for managing:
  - Products (create, update, delete)  
  - Orders  
  - Users
  - Gift Cards
  - Reviews
  - Store Settings
- Image uploads and storage with cloud integration  
- Responsive design for all devices  

## Tech Stack

**Frontend:**
- Vite(React+Typescript)  
- Zustand for state management  
- Tailwind CSS for UI styling  
- Axios for API communication  
- Stripe for payment integration  

**Backend:**
- Node.js with Express.js  
- PostgreSQL (via Prisma ORM)  
- Clerk for authentication  

## Installation

1. Clone the repository

   ```bash
   git clone https://github.com/AdhurimBerisha/TechZone50---Gjirafa50-Clone.git
   ```

2. Install dependencies for frontend and backend

   ```bash
   cd frontend
   npm install

   cd backend
   npm install
   ```

3. Set up environment variables (see below)

## Environment Variables

This project requires a few environment variables to run properly.

- For the **backend**, create a `.env` file.  
- For the **frontend**, create a `.env` file.

### backend `.env` variables include:
- `DATABASE_URL` — your_database_url
- `CLERK_PUBLISHABLE_KEY` — your_clerk_publishable_key
- `CLERK_SECRET_KEY` — your_clerk_secret_key
- `CLOUDINARY_NAME` — your_cloudinary_name
- `CLOUDINARY_KEY` — your_cloudinary_key
- `CLOUDINARY_SECRET` — your_cloudinary_secret_key


### frontend `.env` variables include:
- `VITE_CLERK_PUBLISHABLE_KEY` — your_clerk_publishable_key
- `STRIPE_SECRET_KEY` — your_stripe_secret_key
- `VITE_STRIPE_PUBLISHABLE_KEY` — your_stripe_publishable_key


4. Run the development servers

   ```bash
   # Backend
   npm run dev

   # Frontend
   npm run dev
   ```
