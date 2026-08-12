# 🍱 Tiffin Business Manager (ટિફિન બિઝનેસ મેનેજર)

[![Stack](https://img.shields.io/badge/Stack-MERN-orange.svg)](https://reactjs.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-emerald.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A complete full-stack **Mobile-First Tiffin Business Manager** for small home-based tiffin services. Designed specifically for daily end-of-day business recording, this application replaces traditional paper notebook records with a fast, intuitive digital notebook workflow.

---

## 🌟 Key Features

1. **📱 Daily Digital Notebook**: End-of-day fast multi-entry screen allowing 10–50 customer tiffin entries without navigating between pages.
2. **👤 Ad-Hoc & Regular Customer Support**: Add daily entries for new customers instantly without forced registration; optional "Save as Regular Customer" prompt.
3. **⚡ Quick Autocomplete Search**: Search regular customers to auto-fill name, area, default price, and quantity with one tap.
4. **📊 Mobile-First Dashboard**: Displays Today's Tiffins count, Billed Income, Cash Collected, Expenses, Net Profit, and Total Pending Payments with large touch buttons.
5. **💵 Payment & Billing Tracking**: Record full/partial payments (Cash, UPI, Bank Transfer, Other) with complete per-customer history logs.
6. **🧾 Fast Expense Logging**: Record daily operational expenses (Vegetables, Grocery, Gas, Packaging, Delivery, Electricity, Rent, Other) in under 10 seconds.
7. **📈 Financial Reports**: Daily, Monthly, and Custom date range reports distinguishing Cash Collected from Billed Revenue and calculating Net Business Profit.
8. **🌐 Bilingual Gujarati & English (i18n)**: Default Gujarati interface with instant toggle switch (`ગુજરાતી | English`) and standard Indian Rupee (₹) formatting.
9. **📲 Installable Mobile PWA**: Web App Manifest and Service Worker pre-caching for native-like installation on Android and iOS devices.
10. **📜 Interactive Swagger API Documentation**: OpenAPI 3.0 UI available at `/api-docs`.

---

## 🏗️ System Architecture & Layered Flow

```text
HTTP Request (Axios / Swagger UI)
       ↓
Express REST Route (/api/...)
       ↓
Zod Schema Validation & Middleware
       ↓
Thin Controller (Request/Response Handler)
       ↓
Service Layer (Business & Aggregation Logic)
       ↓
Mongoose Model (User, Customer, DailyTiffin, Payment, Expense)
       ↓
MongoDB Atlas Cloud Database
```

---

## 🗄️ Database Models & Relationships

- **`Customer`**: Regular customer profiles (`name`, `phone`, `address`, `area`, `defaultQuantity`, `defaultPrice`, `planType`, `active`, `startDate`).
- **`DailyTiffin`**: Daily tiffin logs (`date`, `customerId` ref, `customerName`, `area`, `quantity`, `unitPrice`, `totalAmount`, `status`, `skipReason`, `paymentStatus`, `paidAmount`).
- **`Payment`**: Financial payment logs (`customerId` ref, `customerName`, `amount`, `paymentDate`, `paymentMethod`, `notes`).
- **`Expense`**: Daily operational expenses (`date`, `category`, `amount`, `note`).
- **`User`**: Admin account records.

---

## 📁 Project Folder Structure

```text
d:/New/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection & Swagger OpenAPI config
│   │   ├── controllers/     # Thin controllers (customer, tiffin, payment, expense, dashboard, report)
│   │   ├── middleware/      # error handler, validation & pass-through auth
│   │   ├── models/          # User, Customer, DailyTiffin, Payment, Expense Mongoose schemas
│   │   ├── routes/          # Express REST routes
│   │   ├── services/        # Business logic & aggregation services
│   │   ├── validators/      # Zod validation schemas
│   │   ├── utils/           # apiResponse, logger, appError
│   │   ├── seeders/         # Database seeder script (seed.js)
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── tests/               # Jest & Supertest integration suite (api.test.js)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, MobileBottomNav, StatCard, Modal
│   │   ├── context/         # AuthContext, LanguageContext
│   │   ├── i18n/            # gu.json (Gujarati default) & en.json
│   │   ├── pages/           # Dashboard, QuickEntry, TiffinList, Customers, CustomerDetail, Accounts, Reports
│   │   ├── services/        # Axios API client & services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js       # Vite PWA & proxy config
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Set `backend/.env` with your MongoDB Atlas URI:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.t8snekz.mongodb.net/tiffin_db?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Getting Started & Installation

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seed sample customers, tiffins, payments, and expenses
npm run dev      # Starts server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite app on http://localhost:5173
```

---

## 🧪 Testing

Run backend automated Jest test suite:
```bash
cd backend
npm test
```

Includes 8 integration tests covering customer creation, single and bulk notebook daily entries, payments, expenses, today's dashboard calculations, and monthly profit aggregations.

---

## 🌐 API Documentation

Access interactive OpenAPI Swagger UI documentation at:
**`http://localhost:5000/api-docs`**