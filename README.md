# 🍕 PizzaPort - Premium Real-Time Pizza Delivery App

![PizzaPort Banner](https://raw.githubusercontent.com/Arnab27622/PizzaPort/main/public/hero-pizza.webp)

**PizzaPort** is a modern, high-performance, full-stack pizza delivery application. Built with **Next.js 15**, **React 19**, and **WebSockets**, it delivers a real-time ordering experience for customers and a live management dashboard for restaurant administrators. Featuring a wood-fired dark glassmorphic aesthetic, instant payment processing via Razorpay, and strict zero-cache HTTP streaming, PizzaPort makes ordering food as fast, dynamic, and delightful as the pizza itself.

---

## ✨ Key Features

### 👤 For Customers
- **Seamless Authentication**: Secure login and registration using **NextAuth.js**, supporting credentials and **Google OAuth**.
- **Interactive Menu & Customization**: Explore categories, filter bestsellers, search items, and customize pizza sizes and extra ingredients.
- **Dynamic Cart**: Add/remove items, auto-calculate tax and delivery fees, and persist cart state across sessions.
- **Coupon System**: Apply and validate promotional discount codes with real-time minimum order check.
- **Secure Razorpay Payments**: Instant checkout with Razorpay API integration and automatic webhook capture.
- **Real-Time Order Tracking**: 0ms instant WebSocket status updates (Placed ➔ Confirmed ➔ Preparing ➔ Out for Delivery ➔ Delivered / Canceled) without page refreshes.
- **User Profile**: Manage delivery address, update contact details, and view order history.

### 🛡️ For Admins
- **Live Orders Dashboard**: Real-time WebSocket order feed that notifies admins as soon as a customer completes payment.
- **Instant Status Control**: Change order status with one click; updates immediately push to customer devices over WebSockets.
- **Visual Analytics**: Interactive sales charts, revenue metrics, and order statistics powered by **Chart.js**.
- **Menu & Category Management**: Full CRUD operations for menu items, categories, pricing, and custom toppings.
- **User Management**: Monitor user activity, promote admin privileges, or ban abusive users with instant session revocation.
- **Automated Media Storage**: Image uploads and CDN delivery via **Cloudinary**.

---

## ⚡ Real-Time Architecture & Performance

### 📡 WebSocket Engine
- **Custom Dual-ID Subscription**: Handles real-time order tracking channels matching both MongoDB `_id` and Razorpay order reference `razorpayOrderId`.
- **Auto-Bootstrapping Engine**: Automatically boots the underlying WebSocket server (`wsServer.ts`) during API requests.
- **Optimistic State Synchronization**: Updates client React state in 0ms upon receiving socket events while background revalidating data.

### 🚫 Strict HTTP Cache Control
- All order endpoints return explicit `"Cache-Control": "no-store, no-cache, must-revalidate"` headers.
- Client hooks utilize timestamp cache-busting (`?t=${Date.now()}`) to prevent browser disk/memory cache intercepting live WebSocket data syncs.

---

## 🚀 Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Real-Time Messaging**: Custom WebSocket Server (`ws`) with dual-channel broadcasting
- **State Management & Data Fetching**: [SWR](https://swr.vercel.app/) & React Context
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (JWT & Google Provider)
- **Database**: [MongoDB](https://www.mongodb.com/) with Native Driver & [Mongoose](https://mongoosejs.com/)
- **Payment Gateway**: [Razorpay](https://razorpay.com/) (Checkout API & Webhook Verification)
- **Media Storage**: [Cloudinary](https://cloudinary.com/) (CDN Image Pipeline)
- **Validation & Security**: [Zod](https://zod.dev/), [React Hook Form](https://react-hook-form.com/), XSS HTML Sanitization
- **Analytics & Charts**: [Chart.js](https://www.chartjs.org/) & [React-ChartJS-2](https://react-chartjs-2.js.org/)
- **CI/CD Quality**: Lighthouse CI (`@lhci/cli`) GitHub Actions workflow

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- MongoDB Database (Local or MongoDB Atlas)
- Cloudinary Account
- Razorpay Developer Account
- Gmail App Password (or SMTP credentials)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Arnab27622/PizzaPort.git
   cd PizzaPort
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root:

   ```env
   # MongoDB Configuration
   MONGO_URL=your_mongodb_connection_string

   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000/"
   NEXTAUTH_SECRET=your_nextauth_secret

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Contact Form Configuration
   NEXT_PUBLIC_CONTACT_EMAIL=your_contact_email
   SMTP_EMAIL=your_smtp_email
   SMTP_PASSWORD=your_smtp_app_password

   # Razorpay Configuration
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_SECRET_KEY=your_razorpay_secret_key
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_public_razorpay_key_id
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Environment
   NODE_ENV="development"
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📂 Project Structure

```text
pizza-delivery-app/
├── .github/
│   └── workflows/          # Lighthouse CI automated build workflow
├── public/                 # Optimized WebP assets & branding icons
├── src/
│   ├── app/                # Next.js 15 App Router (Pages & API endpoints)
│   │   ├── api/            # REST & WebSocket boot endpoints
│   │   ├── orders/         # Admin order management
│   │   ├── user-orders/    # Customer order tracking & history
│   │   └── menuitem/       # Admin menu item management
│   ├── components/         # Modular React components
│   │   ├── cart/           # Shopping cart list & price summary
│   │   ├── layout/         # Glassmorphic Navbar, Hero, & Footer
│   │   ├── menu/           # Category filters, search, & form modals
│   │   └── orders/         # Status badges, tracking header, & order cards
│   ├── hooks/              # Custom hooks (useOrderSocket, useUserOrders, etc.)
│   ├── lib/                # Database connection, auth options, & WS Server engine
│   ├── types/              # TypeScript types and interfaces
│   └── utils/              # Helper utilities & XSS sanitizers
├── lighthouserc.cjs        # Lighthouse CI performance budget config
└── README.md
```

---

## 🎨 UI/UX Philosophy

PizzaPort follows a **Wood-Fired Dark Glassmorphic Design System**:
- **Rich Dark Palette**: Warm obsidian backgrounds (`#18120c`) with gold/amber accents (`#f59e0b`).
- **Live Indicator Badges**: Animated pulsing dots for active real-time order tracking.
- **Glassmorphism**: Backdrop blur overlays (`backdrop-blur-md`), ambient glow shadows, and smooth borders.
- **Responsive & Accessible**: 100% WCAG AA color contrast compliance and mobile-first layouts.

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AwesomeFeature`)
3. Commit your Changes (`git commit -m 'Add some AwesomeFeature'`)
4. Push to the Branch (`git push origin feature/AwesomeFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [Arnab](https://github.com/Arnab27622)
