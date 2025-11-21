# Healthcare Appointment Booking System

A full-stack healthcare appointment booking system with AI-powered doctor recommendations. Features patient portal, admin dashboard, doctor panel, real-time chat, and multi-specialty support (Cardiologist, Neurologist, Gynecologist, etc.). Built with React, Node.js, MongoDB, and Google Gemini AI for intelligent symptom-to-specialty mapping.

## ✨ Features

- **Patient Portal**: Browse doctors, book appointments, manage profile
- **Admin Dashboard**: Manage doctors, appointments, and system overview
- **Doctor Panel**: View appointments, manage availability, patient interactions
- **AI Assistant**: Intelligent symptom-based doctor recommendations using Google Gemini
- **Real-time Chat**: Socket.IO powered messaging between patients and doctors
- **Multi-specialty Support**: General Physician, Cardiologist, Neurologist, Gynecologist, Dermatologist, Pediatricians, Gastroenterologist
- **Payment Integration**: Razorpay payment gateway support
- **Image Upload**: Cloudinary integration for profile and document images
- **Responsive Design**: Modern UI built with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Google Gemini AI** - AI assistant
- **Cloudinary** - Image storage
- **Razorpay** - Payment gateway
- **Multer** - File upload handling

### Admin Panel
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling

## 📁 Project Structure

```
project1/
├── frontend/          # Patient-facing React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── assets/        # Images and icons
│   │   └── context/       # React context providers
│   └── package.json
│
├── admin/            # Admin panel React application
│   ├── src/
│   │   ├── pages/         # Admin pages
│   │   ├── components/    # Admin components
│   │   └── context/       # Context providers
│   └── package.json
│
├── backend/          # Node.js backend server
│   ├── config/           # Database and service configs
│   ├── controllers/      # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth and upload middleware
│   ├── sockets/          # Socket.IO server
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**
- **Google Gemini API Key** (free tier available)
- **Cloudinary Account** (for image storage)
- **Razorpay Account** (optional, for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project1
   ```

2. **Install dependencies**

   Backend:
   ```bash
   cd backend
   npm install
   ```

   Frontend:
   ```bash
   cd ../frontend
   npm install
   ```

   Admin Panel:
   ```bash
   cd ../admin
   npm install
   ```

3. **Environment Variables**

   Create a `.env` file in the `backend` directory:
   ```env
   # Server
   PORT=5500

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key_here

   # Admin Credentials
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123

   # Cloudinary
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

   # Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key

   # Razorpay (Optional)
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   CURRENCY=INR
   ```

4. **Get Google Gemini API Key**

   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key and add it to your `.env` file
   - See `backend/GEMINI_SETUP.md` for detailed instructions

5. **Set up Cloudinary**

   - Create a free account at [Cloudinary](https://cloudinary.com)
   - Get your Cloud Name, API Key, and API Secret
   - Add them to your `.env` file

### Running the Application

1. **Start MongoDB**
   - Make sure MongoDB is running locally or use MongoDB Atlas

2. **Start Backend Server**
   ```bash
   cd backend
   npm run server
   ```
   Server will run on `http://localhost:5500`

3. **Start Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173` (or similar)

4. **Start Admin Panel** (in a new terminal)
   ```bash
   cd admin
   npm run dev
   ```
   Admin panel will run on `http://localhost:5174` (or similar)

## 📡 API Endpoints

### User Routes (`/api/user`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /doctors` - Get all doctors
- `POST /appointment` - Book appointment
- `GET /appointments/:userId` - Get user appointments
- `POST /payment` - Create payment order

### Admin Routes (`/api/admin`)
- `POST /login` - Admin login
- `POST /add-doctor` - Add new doctor
- `GET /doctors` - Get all doctors
- `GET /appointments` - Get all appointments
- `POST /appointment/cancel/:id` - Cancel appointment

### Doctor Routes (`/api/doctor`)
- `POST /login` - Doctor login
- `GET /appointments/:doctorId` - Get doctor appointments
- `POST /appointment/complete/:id` - Mark appointment complete
- `POST /availability` - Change availability status

### AI Routes (`/api/ai`)
- `POST /assistant` - AI chat assistant
- `POST /analyze-report` - Analyze medical reports (PDF/Image)

### Chat Routes (`/api/chat`)
- `GET /messages/:appointmentId` - Get chat messages
- `POST /send` - Send message

## 🎯 Key Features Explained

### AI-Powered Doctor Recommendations
The system uses Google Gemini AI to analyze patient symptoms and recommend the appropriate doctor specialty. The AI assistant can:
- Understand natural language symptom descriptions
- Map symptoms to medical specialties
- Suggest relevant doctors
- Provide general health information

### Real-time Chat
Socket.IO enables real-time messaging between patients and doctors during appointments, allowing for seamless communication.

### Multi-specialty Support
The system supports multiple medical specialties:
- General Physician
- Cardiologist
- Neurologist
- Gynecologist
- Dermatologist
- Pediatricians
- Gastroenterologist

## 🚀 Deployment

For detailed deployment instructions, see [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

### Quick Deployment Summary

**Backend Start Command:**
```bash
npm start
```

**Important:** Do NOT use `npm run server` in production as it uses nodemon (development tool).

**Environment Variables:**

**Backend:**
- Add all environment variables from the `.env` file to your hosting platform's environment variables section
- Make sure MongoDB Atlas connection string is properly configured
- Ensure all API keys (Gemini, Cloudinary, Razorpay) are set
- Optional: `FRONTEND_URL` - Your frontend URL (for CORS)

**Frontend:**
- `VITE_BACKEND_URL` - Your backend API URL (e.g., `https://healthcare-appointment-system-backend.onrender.com`)

**Admin Panel:**
- `VITE_BACKEND_URL` - Your backend API URL (same as frontend)

**Build Commands:**
- Frontend: `npm run build` (outputs to `dist/` folder)
- Admin: `npm run build` (outputs to `dist/` folder)
- Backend: No build step required

**CORS Configuration:**
- The backend is configured to allow requests from the Render frontend and admin URLs
- If you change your URLs, update the `allowedOrigins` array in `backend/server.js`
## 🔒 Security

- JWT-based authentication for all users
- Password hashing with bcrypt
- Protected API routes with middleware
- Secure file upload handling
- Environment variables for sensitive data

## 📝 Notes

- The default admin credentials should be changed in production
- Ensure all environment variables are properly configured
- MongoDB connection string should include the database name
- Cloudinary is used for all image storage
- Razorpay integration is optional but recommended for production

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ for better healthcare management**

