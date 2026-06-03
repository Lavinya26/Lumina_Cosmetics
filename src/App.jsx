import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

import StoreFront from './pages/StoreFront';
import AdminDashboard from './pages/AdminDashboard';
import Inventory from './pages/Inventory';
import AdminLogin from './pages/AdminLogin';
import ClienteLogin from './pages/ClienteLogin'; // Nome correto do arquivo


const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('admin_auth') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StoreFront />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/cliente-login" element={<ClienteLogin />} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
     
      </Router>
    </CartProvider>
  );
}

export default App;