import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import RegisterCompany from './pages/RegisterCompany'
import AcceptInvite from './pages/AcceptInvite'
import Docs from './pages/Docs'
import Pricing from './pages/Pricing'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/Dashboard'
import SprintDetail from './pages/SprintDetail'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Team from './pages/Team'
import Company from './pages/Company'
import { isAuthenticated } from './api'

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register-company" element={<RegisterCompany />} />
      <Route path="/accept-invite/:token" element={<AcceptInvite />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="sprints/:id" element={<SprintDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="team" element={<Team />} />
        <Route path="company" element={<Company />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
