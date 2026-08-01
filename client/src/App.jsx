import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const Hotels = lazy(() => import('./pages/Hotels'));
const ManagerAuth = lazy(() => import('./pages/ManagerAuth'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const AddProperty = lazy(() => import('./pages/AddProperty/AddProperty'));
const ManagerForgotPassword = lazy(() => import('./pages/ManagerForgotPassword'));
const ManagerResetPassword = lazy(() => import('./pages/ManagerResetPassword'));
const ManagerHotels = lazy(() => import('./pages/ManagerHotels/ManagerHotels'));
const HotelEdit = lazy(() => import('./pages/ManagerHotels/HotelEdit'));
const HotelDetail = lazy(() => import('./pages/HotelDetail'));
const ManagerKyc = lazy(() => import('./pages/ManagerKyc'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const ManagerProfile = lazy(() => import('./pages/ManagerProfile/ManagerProfile'));
const TestPayment = lazy(() => import('./pages/TestPayment'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const RoomTypes = lazy(() => import('./pages/ManagerHotels/RoomTypes'));
const MyBookings = lazy(() => import('./pages/MyBookings'));

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center" }}>Loading…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<CompleteProfile />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/hotels/:hotelId" element={<HotelDetail />} />
              <Route path="/manager/auth" element={<ManagerAuth />} />
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/manager/profile" element={<ManagerProfile />} />
              <Route path="/manager/add-property" element={<AddProperty />} />
              <Route path="/manager/forgot-password" element={<ManagerForgotPassword />} />
              <Route path="/manager/reset-password/:token" element={<ManagerResetPassword />} />
              <Route path="/manager/hotels" element={<ManagerHotels />} />
              <Route path="/manager/hotels/edit/:hotelId" element={<HotelEdit />} />
              <Route path="/manager/kyc" element={<ManagerKyc />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/test-payment" element={<TestPayment />} />
              <Route path="/booking/:hotelId/:roomId" element={<BookingPage />} />
              <Route path="/manager/hotels/:hotelId/rooms" element={<RoomTypes />} />
              <Route path="/my-bookings" element={<MyBookings />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;