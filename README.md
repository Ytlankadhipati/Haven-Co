# HavenCO 🏨

A full-stack hotel booking web application — search, list, and book hotels with a distinctive "boarding pass" travel-themed design. Built as a 6-person team project.

---

## ✨ Features

- **Dual authentication systems**
  - Regular users: Firebase Auth (Google Sign-In + Phone OTP)
  - Managers: Custom JWT auth (email/password + Google), with password reset via email
  - Admins: Custom JWT auth (manually seeded, no public registration)
- **Manager property listings** — a 4-step "Add Property" wizard (property type, address with PIN-code auto-fill, interactive map location picker, room/photo details), with Cloudinary-powered image uploads
- **Room management** — hotels support multiple room types (Standard, Deluxe, Suite, etc.), each with its own price, occupancy, and inventory
- **Admin approval workflow** — managers, hotels, and KYC documents all go through a `pending → approved/rejected` review process before going live
- **Manager identity verification (KYC)** — government ID document upload and admin review
- **Hotel search & listings** — filter by city, price range, amenities, and rating; connected to real, admin-approved hotel data
- **Location-aware** — hotels store lat/lng coordinates (free OpenStreetMap Nominatim geocoding) for future map display
- **Email notifications** — password reset links sent via Gmail SMTP
- **Payment integration** — Razorpay (test mode), in progress

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, plain CSS (custom design system) |
| Backend | Node.js + Express (ES Modules) |
| Database | MongoDB Atlas |
| Regular-user auth | Firebase Authentication |
| Manager/Admin auth | JWT + bcrypt |
| Image storage | Cloudinary + Multer |
| Maps/Geocoding | Leaflet + react-leaflet, OpenStreetMap Nominatim (free, no API key) |
| Email | Nodemailer + Gmail SMTP |
| Payments | Razorpay (test mode) |
| Rate limiting | express-rate-limit |

---

## 📁 Project Structure

```
HAVEN-CO/
├── client/                          # React + Vite frontend
│   └── src/
│       ├── components/              # Navbar, Hero, SearchBar, HotelListCard,
│       │                            # FilterSidebar, AuthForm, LocationPicker, etc.
│       ├── pages/
│       │   ├── Home.jsx, Login.jsx, Signup.jsx, CompleteProfile.jsx
│       │   ├── Hotels.jsx                    # user-facing hotel listing
│       │   ├── ManagerAuth.jsx, ManagerDashboard.jsx
│       │   ├── ManagerForgotPassword.jsx, ManagerResetPassword.jsx
│       │   ├── ManagerHotels/                # manager's own hotel management
│       │   ├── ManagerKyc.jsx, ManagerProfile/
│       │   ├── AddProperty/                  # 4-step property listing wizard
│       │   ├── Admin/                        # AdminLogin.jsx, AdminDashboard.jsx
│       │   └── TestPayment.jsx               # Razorpay test page
│       ├── context/                 # AuthContext, ManagerAuthContext, AdminAuthContext
│       ├── firebase/firebaseConfig.js
│       └── utils/geocodeAddress.js
│
└── Backend/                         # Express API server
    ├── config/                      # db.js, cloudinary.js, razorpay.js
    ├── middleware/                  # upload.js, managerAuth.js, adminAuth.js, rateLimiter.js
    ├── models/                      # User.js, Manager.js, Admin.js, Hotel.js, RoomType.js
    ├── controllers/                 # userController, managerController, adminController,
    │                                # hotelController, roomController, paymentController
    ├── routes/                      # matching route files for each controller
    ├── utils/notificationService.js # shared sendEmail() helper
    ├── scripts/seedAdmin.js         # one-time script to create the first admin
    └── server.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas account (free M0 tier is enough)
- A Firebase project (Authentication enabled: Google + Phone providers)
- A Cloudinary account (free tier)
- A Gmail account with an App Password (for email sending)
- A Razorpay account (test mode keys)

### 1. Clone the repo
```bash
git clone <repo-url>
cd HAVEN-CO
```

### 2. Backend setup
```bash
cd Backend
npm install
```

Create a `Backend/.env` file:
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/havenco?appName=<appname>
PORT=5001

JWT_SECRET=<any random string>

CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your api key>
CLOUDINARY_API_SECRET=<your api secret>

EMAIL_USER=<your gmail address>
EMAIL_APP_PASSWORD=<16-character gmail app password, no spaces>

RAZORPAY_KEY_ID=<your razorpay test key id>
RAZORPAY_KEY_SECRET=<your razorpay test key secret>
```

> ⚠️ Note: port `5000` is commonly occupied on macOS by the AirPlay Receiver service — this project runs the backend on **5001** instead.

Seed the first admin account (no public admin registration exists by design):
```bash
node scripts/seedAdmin.js
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd client
npm install
```

Add your Firebase config to `client/src/firebase/firebaseConfig.js`.

Start the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`, with the API at `http://localhost:5001`.

---

## 🔑 Key API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/users/sync` | — | Create/find a regular user after Firebase login |
| GET/PUT | `/api/users/:firebaseUid` / `/api/users/profile` | — | Get/update user profile |
| POST | `/api/managers/register` \| `/login` \| `/google-auth` | — | Manager auth |
| POST | `/api/managers/forgot-password` \| `/reset-password` | — | Manager password reset |
| POST | `/api/managers/upload-kyc` | Manager JWT | Upload KYC document |
| GET | `/api/hotels` | — | List all **approved** hotels (supports `?city=&minPrice=&maxPrice=&minRating=`) |
| POST | `/api/hotels` | Manager JWT | Create a new hotel listing |
| GET | `/api/hotels/manager/:managerId` | Manager JWT (own only) | A manager's own hotels, any status |
| GET/POST/PUT/DELETE | `/api/rooms/...` | Manager JWT (writes) | Room type CRUD for a hotel |
| POST | `/api/admin/login` | — | Admin login |
| GET/PUT | `/api/admin/managers`, `/api/admin/hotels`, `/api/admin/kyc` | Admin JWT | Approve/reject managers, hotels, KYC docs |

---

## 🧩 Team Module Breakdown

| Module | Scope | Status |
|---|---|---|
| 1 — Core Auth | User/Manager/Admin models, JWT patterns, security hardening, password reset, KYC, notifications, geolocation | ✅ ~90% done |
| 2 — Room Management | RoomType model + CRUD backend | ✅ Done |
| 3 — User-Facing Frontend | Real hotel listing, hotel detail page, search/filter UI | 🟡 In progress |
| 4 — Manager Frontend Extensions | "My Hotels" management UI, room-type UI, booking inbox | 🟡 Partially unblocked |
| 5 — Admin Panel | Approval dashboard for managers/hotels/KYC | ✅ Done |
| 6 — Booking, Payments & Deployment | Booking/Review/Coupon models, Razorpay flow, deployment | 🟡 Early stage |

---

## 🐛 Known Issues / Gotchas

- macOS AirPlay Receiver occupies port 5000 — backend uses 5001
- MongoDB connection string needs an explicit database name (`/havenco`) in the URI, or Mongoose silently defaults to a `test` database
- `userController.js` currently trusts `firebaseUid` from the request without server-side Firebase session verification — tracked as a pre-deployment security item (needs Firebase Admin SDK)
- Firebase Phone Auth on the free Spark plan requires configuring test phone numbers in the Firebase Console for development — real SMS requires upgrading to the Blaze (pay-as-you-go) plan
- `.env` files are never committed — request credentials privately from whichever teammate manages that service

---

## 🌿 Git Workflow

- Never work directly on `main` — create a feature branch: `git checkout -b feature/your-module-name`
- `git pull origin main` before starting new work each day
- Open a Pull Request for review before merging
- Coordinate before editing shared files (`server.js`, `Hotel.js`, `App.jsx`) since multiple modules touch them

---

## 📄 License

Student/team project — not currently licensed for external use.