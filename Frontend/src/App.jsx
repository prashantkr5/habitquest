import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import { ThemeProvider } from './Context/ThemeContext';
import { ToastProvider } from './Context/ToastContext';
import './App.css';
import Login from './Pages/Login/Login';
import Signup from './Pages/Signup/Signup';
import ToDo from './Pages/To-Do-List/To-do';
import Loading from './Pages/Loading';
import Dashboard from './Pages/Dashboard/Dashboard';
import Focus from './Pages/Focus/Focus';
import Journal from './Pages/Journal/Journal';
import Profile from './Pages/Profile/Profile';
import Habits from './Pages/Habits/Habits';
import Leaderboard from './Pages/Social/Leaderboard';
import Layout from './Components/Layout';
import { useAuth } from './Context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ae2ff', background: '#0a0f1c'}}>VERIFYING SECURE CONNECTION...</div>;
  }
  
  if (!user) {
    return <Navigate to="/Login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/Login" replace />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/Loading" element={<Loading />} />
            
            {/* Authenticated Layout Routes */}
            <Route path="/Dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/Habits" element={<ProtectedRoute><Layout><Habits /></Layout></ProtectedRoute>} />
            <Route path="/ToDo" element={<ProtectedRoute><Layout><ToDo /></Layout></ProtectedRoute>} />
            <Route path="/Focus" element={<ProtectedRoute><Layout><Focus /></Layout></ProtectedRoute>} />
            <Route path="/Journal" element={<ProtectedRoute><Layout><Journal /></Layout></ProtectedRoute>} />
            <Route path="/Profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="/Leaderboard" element={<ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>} />
          </Routes>
        </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
