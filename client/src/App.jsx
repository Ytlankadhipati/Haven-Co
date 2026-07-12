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

        </Routes>
        
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;