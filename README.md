# 🍕 PizzaPort - Premium Pizza Delivery App

![PizzaPort Banner](https://raw.githubusercontent.com/Arnab27622/PizzaPort/main/public/hero-pizza.png)

**PizzaPort** is a modern, high-performance, full-stack pizza delivery application. Built with **Next.js 15**, it offers a seamless ordering experience for customers and a powerful management suite for administrators. Featuring a stunning dark-mode aesthetic, real-time payment integration, and robust data handling, PizzaPort is designed to make food ordering as delightful as the pizza itself.

---

## ✨ Key Features

### 👤 For Customers
- **Seamless Authentication**: Secure login and registration using **NextAuth.js**, supporting both credentials and **Google OAuth**.
- **Intuitive Menu**: Explore various categories, search for your favorite pizzas, and view detailed descriptions.
- **Dynamic Cart**: Add/remove items, customize orders, and manage quantities with ease.
- **Coupon System**: Apply discount codes to save on your orders.
- **Secure Payments**: Integrated with **Razorpay** for a smooth and secure checkout process.
- **Order Tracking**: Real-time progress tracking from "Pending" to "Delivered".
- **User Profile**: Manage personal information and view detailed order history.

### 🛡️ For Admins
- **Interactive Dashboard**: Visualized sales data and analytics using **Chart.js**.
- **User Management**: View and manage all registered users.
- **Menu & Category Control**: Full CRUD operations for menu items and food categories.
- **Order Management**: Monitor all incoming orders, update statuses, and manage deliveries.
- **Image Uploads**: Automated image hosting via **Cloudinary**.

---

## 🚀 Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [SWR](https://swr.vercel.app/) (Data Fetching), React Context
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Payment Gateway**: [Razorpay](https://razorpay.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Storage**: [Cloudinary](https://cloudinary.com/) (Media/Images)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Notifications**: [React Toastify](https://fkhadra.github.io/react-toastify/)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (Latest LTS version recommended)
- MongoDB Database
- Cloudinary Account
- Razorpay Developer Account
- Gmail App Password (or other SMTP Service)

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

3. **Environment Setup**:
   Create a `.env` file in the root directory and add the following variables:

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

   # Node Environment
   NODE_ENV="development"
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 📂 Project Structure

```text
src/
├── app/            # Next.js App Router (Pages & API Routes)
├── components/     # Reusable UI Components
├── hooks/          # Custom React Hooks
├── lib/            # Configuration logs (DB, Auth, etc.)
├── types/          # TypeScript interfaces and types
└── utils/          # Helper functions
```

---

## 🎨 UI/UX Philosophy

PizzaPort follows a **Premium Dark Aesthetic** with:
- **Responsive Layouts**: Optimized for mobile, tablet, and desktop.
- **Micro-animations**: Enhanced user engagement via Framer Motion.
- **Clear Typography**: Using clean, modern fonts for readability.
- **Interactive Feedback**: Loading states, toast notifications, and progress bars for a smooth journey.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [Arnab](https://github.com/Arnab27622)
