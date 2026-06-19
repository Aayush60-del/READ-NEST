<div align="center">

# 📚 ReadNest

### A modern full-stack digital reading platform for discovering books, reading PDFs, tracking progress, and building consistent reading habits.

<br />

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge\&logo=tailwindcss\&logoColor=38BDF8)
![Node.js](https://img.shields.io/badge/Node.js-14532D?style=for-the-badge\&logo=nodedotjs\&logoColor=22C55E)
![Express](https://img.shields.io/badge/Express.js-111827?style=for-the-badge\&logo=express\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-052E16?style=for-the-badge\&logo=mongodb\&logoColor=22C55E)
![AWS S3](https://img.shields.io/badge/AWS_S3-FF9900?style=for-the-badge\&logo=amazonaws\&logoColor=white)

</div>

---

## ✨ Overview

**ReadNest** is a full-stack reading platform designed for users who want a clean and focused digital reading experience.
It combines a beautiful book discovery interface, an in-app PDF reader, personal library management, reading progress tracking, bookmarks, notes, streaks, and habit analytics.

The project focuses on three things:

* **Reading experience** — smooth PDF reading with progress tracking.
* **Habit building** — streaks, active days, and a 30-day heatmap.
* **Modern product UI** — animated landing page, clean dashboard, and premium visual design.

---

## 🚀 Key Highlights

| Feature                | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| 📖 PDF Reader          | Read uploaded books directly inside the application       |
| 📚 Personal Library    | Save books, continue reading, and manage reading progress |
| 🔖 Bookmarks           | Mark important pages while reading                        |
| 📝 Notes & Highlights  | Save useful thoughts, highlights, and reading notes       |
| 🔥 Reading Streak      | Track daily reading consistency                           |
| 📊 Analytics Dashboard | View books read, active days, streaks, and habit score    |
| 🗓️ 30-Day Heatmap     | Visual calendar showing daily reading activity            |
| 🛠️ Admin Panel        | Upload books, manage users, and control platform data     |
| ☁️ AWS S3 Storage      | Store and serve book PDFs using cloud storage             |
| 🎨 Animated UI         | Built with Framer Motion, GSAP, Lenis, and Tailwind CSS   |

## 🧠 Why ReadNest?

Most library projects only show static book cards.
ReadNest goes beyond that by adding real product-level features like:

* user authentication
* cloud PDF upload
* reading progress persistence
* personal library
* notes and bookmarks
* reading statistics
* streak heatmap
* admin book management
* premium animated landing page

This makes ReadNest feel closer to a real digital reading product instead of a basic CRUD project.

---

## 🛠️ Tech Stack

### Frontend

| Technology         | Purpose                     |
| ------------------ | --------------------------- |
| React              | Frontend UI                 |
| Vite               | Fast development build tool |
| Tailwind CSS       | Styling and responsive UI   |
| React Router       | Client-side routing         |
| Axios              | API requests                |
| Framer Motion      | UI animations               |
| GSAP               | Scroll-based animations     |
| Lenis              | Smooth scrolling            |
| React PDF          | PDF rendering               |
| Lucide React       | Icons                       |
| Firebase Messaging | Push notification support   |

### Backend

| Technology     | Purpose                 |
| -------------- | ----------------------- |
| Node.js        | Runtime environment     |
| Express.js     | Backend API framework   |
| MongoDB        | Database                |
| Mongoose       | MongoDB object modeling |
| JWT            | Authentication          |
| Bcrypt.js      | Password hashing        |
| AWS S3 SDK     | Book PDF storage        |
| Multer         | File upload handling    |
| Passport OAuth | OAuth support           |
| Firebase Admin | Notification backend    |
| Node Cron      | Scheduled backend tasks |

---

## 📁 Folder Structure

```bash
ReadNest/
│
├── client/
│   ├── public/
│   │   └── images/
│   │
│   ├── src/
│   │   ├── Pages/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── config/
│   │   ├── lib/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   │
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🔐 Core Features

### Authentication

* User registration
* User login
* JWT-based session handling
* Protected routes
* Secure password hashing

### Book Management

* Add books
* Store book metadata
* Upload PDFs
* Fetch book details
* Serve PDF files securely

### Reading System

* Open books inside the PDF reader
* Save reading progress
* Continue from last read position
* Track active reading days

### User Library

* Save books to personal library
* View currently reading books
* Track completed books
* Manage reading history

### Notes & Bookmarks

* Add bookmarks while reading
* Save notes connected to books
* Store highlights and important points
* Access reading material later

### Reading Analytics

* Books completed
* Current reading count
* Reading streak
* Active days
* Habit score
* 30-day consistency heatmap

### Admin Dashboard

* Upload books
* Manage book records
* Manage users
* Monitor platform activity
* Handle digital library content

---

## ⚙️ Environment Variables

### Server `.env`

```env
PORT=5000
CLIENT_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your_s3_bucket_name

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

FIREBASE_SERVICE_ACCOUNT_JSON=
```

### Client `.env`

```env
VITE_API_URL=http://localhost:5000

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_VAPID_KEY=
```

---

## 🚀 Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Aayush60-del/READ-NEST.git
cd READ-NEST
```

### 2. Install frontend dependencies

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

### 3. Install backend dependencies

```bash
cd server
npm install
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

## 🔑 Main Routes

### Frontend Routes

| Route             | Page              |
| ----------------- | ----------------- |
| `/`               | Landing Page      |
| `/auth`           | Login / Register  |
| `/overview`       | User Dashboard    |
| `/discover`       | Discover Books    |
| `/library`        | Personal Library  |
| `/stats`          | Reading Analytics |
| `/settings`       | User Settings     |
| `/feedback`       | Feedback Page     |
| `/admin`          | Admin Dashboard   |
| `/books/:id/read` | PDF Reader        |

### Backend API Areas

| API Area          | Purpose                             |
| ----------------- | ----------------------------------- |
| Auth APIs         | Register, login, profile, password  |
| User APIs         | User data and settings              |
| Book APIs         | Books, PDFs, library data           |
| Reading APIs      | Progress, streaks, notes, bookmarks |
| Admin APIs        | Book upload and management          |
| Notification APIs | Push notification handling          |

---

## 🎯 Future Improvements

* 🤖 AI reading companion
* 🏆 Achievement badges
* ⭐ Book ratings and reviews
* 🎯 Daily and monthly reading goals
* 📈 Advanced reading analytics
* 🧑‍🤝‍🧑 Social reading groups
* 🔍 Smart book recommendations
* 🌙 Better mobile reading mode
* 📤 Notes export as PDF
* 🧠 AI-generated summaries and quizzes

---

## 👨‍💻 Author

**Ayush Negi**

* GitHub: [Aayush60-del](https://github.com/Aayush60-del)
* Repository: [READ-NEST](https://github.com/Aayush60-del/READ-NEST)

---

## ⭐ Show Your Support

If this project helped you or you liked the idea, consider giving it a star on GitHub.

---

<div align="center">

### Built with ❤️ for readers who want to read more consistently.

</div>
