# Placement Preparation Portal

A comprehensive full-stack web application for placement preparation, similar to platforms like placementpreparation.io. Users can practice aptitude questions, programming questions, company-specific interview questions, and take mock tests.

## 🚀 Features

### User Features
- **User Authentication**: OTP-based registration and login (Email verification)
- **Dashboard**: Personalized dashboard with stats and quick actions
- **Aptitude Practice**: Quantitative, Logical Reasoning, Verbal Ability, and more
- **Programming Section**: Code editor with Monaco Editor, supports JavaScript, Python, Java, C++, SQL
- **Company Preparation**: TCS, Infosys, Wipro, Accenture, Capgemini, Amazon, Google, Microsoft
- **Mock Tests**: Timed tests with multiple sections
- **Daily Challenge**: Earn extra points daily
- **Leaderboard**: Compete with other users
- **Bookmarks**: Save questions for later
- **Resume Builder**: Create and download professional resumes

### Admin Features
- User management
- Question management (MCQs and Coding)
- Mock test creation
- Analytics dashboard

## 🛠️ Tech Stack

### Frontend
- React.js 18+
- Tailwind CSS
- React Router v6
- Axios
- Monaco Editor
- Lucide Icons
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- JWT Authentication
- Nodemailer

### Compiler Integration
- Judge0 API (RapidAPI)

## 📁 Project Structure

```
placement-preparation-portal/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── questionController.js
│   │   ├── codingController.js
│   │   ├── companyController.js
│   │   ├── mockTestController.js
│   │   ├── userController.js
│   │   └── leaderboardController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── admin.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── CodingQuestion.js
│   │   ├── CompanyQuestion.js
│   │   ├── MockTest.js
│   │   └── Submission.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── questionRoutes.js
│   │   ├── codingRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── mockTestRoutes.js
│   │   ├── userRoutes.js
│   │   ├── adminRoutes.js
│   │   └── leaderboardRoutes.js
│   ├── utils/
│   │   ├── emailSender.js
│   │   └── otpGenerator.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layouts/
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── aptitude/
│   │   │   ├── programming/
│   │   │   ├── companies/
│   │   │   ├── tests/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   └── ResumeBuilder.jsx
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── SPEC.md
└── README.md
```

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Judge0 API key (RapidAPI)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your values:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   JUDGE0_API_KEY=your_judge0_api_key
   FRONTEND_URL=http://localhost:5173
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and visit: `http://localhost:5173`

## 🔑 Default Admin Account

After setting up the database, you can create an admin user through:
1. Register a new account through the signup page
2. Manually update the user's `isAdmin` field to `true` in MongoDB

Or use the seed script to populate sample data.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login (sends OTP)
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get questions (with filters)
- `POST /api/questions` - Add question (admin)
- `PUT /api/questions/:id` - Update question (admin)
- `DELETE /api/questions/:id` - Delete question (admin)

### Coding Questions
- `GET /api/coding-questions` - Get coding questions
- `POST /api/coding-questions/run` - Run code
- `POST /api/coding-questions/submit` - Submit solution

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:name` - Get company questions

### Mock Tests
- `GET /api/mock-tests` - Get all tests
- `POST /api/mock-tests/:id/submit` - Submit test

### User
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/bookmarks` - Get bookmarks
- `POST /api/user/bookmarks` - Add bookmark

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard

## 🎨 UI Features

- Dark and Light mode support
- Responsive design (mobile, tablet, desktop)
- Interactive code editor
- Real-time progress tracking
- Professional dashboard layout
- Smooth animations and transitions

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- Design inspiration from placementpreparation.io
- Monaco Editor by Microsoft
- Judge0 for code execution

