import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CompleteProfile from './pages/CompleteProfile';
import Hotels from './pages/Hotels';
import ManagerAuth from './pages/ManagerAuth';
import ManagerDashboard from './pages/ManagerDashboard';
import AddProperty from './pages/AddProperty/AddProperty';
import ManagerForgotPassword from './pages/ManagerForgotPassword';
import ManagerResetPassword from './pages/ManagerResetPassword';
import ManagerHotels from './pages/ManagerHotels/ManagerHotels';
import HotelEdit from './pages/ManagerHotels/HotelEdit';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<CompleteProfile />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/manager/auth" element={<ManagerAuth />} />
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/add-property" element={<AddProperty />} />
          <Route path="/manager/forgot-password" element={<ManagerForgotPassword />} />
          <Route path="/manager/reset-password/:token" element={<ManagerResetPassword />} />
          <Route path="/manager/hotels" element={<ManagerHotels />} />
          <Route path="/manager/hotels/edit/:hotelId" element={<HotelEdit />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;