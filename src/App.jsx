import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import useStore from './store/useStore'
import { ToastProvider } from './contexts/ToastContext'
import ToastContainer from './components/ui/ToastContainer'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Plans from './pages/Plans'
import Customers from './pages/Customers'
import Subscriptions from './pages/Subscriptions'
import CreateSubscription from './pages/CreateSubscription'
import ManageSubscriptions from './pages/ManageSubscriptions'
import Users from './pages/Users'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  const { isAuthenticated, initializeDarkMode } = useStore()

  useEffect(() => {
    initializeDarkMode()
  }, [initializeDarkMode])

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Routes>
            <Route
              path="/login"
              element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="/"
              element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="plans" element={<Plans />} />
              <Route path="customers" element={<Customers />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="subscriptions/create" element={<CreateSubscription />} />
              <Route path="subscriptions/manage" element={<ManageSubscriptions />} />
              <Route path="users" element={<Users />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
    </ToastProvider>
  )
}

export default App
