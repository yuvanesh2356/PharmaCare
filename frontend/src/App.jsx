import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RetailerDashboard from './pages/RetailerDashboard';
import RetailerInventoryPage from './pages/RetailerInventoryPage';
import RetailerReturnsPage from './pages/RetailerReturnsPage';
import RetailerScanPage from './pages/RetailerScanPage';
import RetailerAlertsPage from './pages/RetailerAlertsPage';
import RetailerReturnTrackingPage from './pages/RetailerReturnTrackingPage';
import DistributorDashboard from './pages/DistributorDashboard';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import InvestigatorDashboard from './pages/InvestigatorDashboard';
import DestructionProofsPage from './pages/DestructionProofsPage';
import BatchesPage from './pages/BatchesPage';
import BatchDetailView from './pages/BatchDetailView';
import AlertsPage from './pages/AlertsPage';
import MapView from './pages/MapView';
import ArchitecturePage from './pages/ArchitecturePage';
import ReentryScannerModal from './components/ReentryScannerModal';
import { api } from './services/api';

function MainLayout() {
  const { user } = useAuth();
  const [alertCount, setAlertCount] = useState(0);
  const [reentryModalOpen, setReentryModalOpen] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await api.getAlerts();
      setAlertCount(res.filter((a) => a.status === 'OPEN').length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const userRoleLower = user?.role ? user.role.toLowerCase() : 'retailer';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header Bar */}
      <Header
        onTriggerDemo={fetchAlerts}
        onOpenReentryModal={() => setReentryModalOpen(true)}
        alertCount={alertCount}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Routes>
            <Route path="/" element={<Navigate to={`/dashboard/${userRoleLower}`} replace />} />
            
            {/* Role-Protected Dashboards */}
            <Route
              path="/dashboard/retailer"
              element={
                <ProtectedRoute allowedRoles={['RETAILER']}>
                  <RetailerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/distributor"
              element={
                <ProtectedRoute allowedRoles={['DISTRIBUTOR']}>
                  <DistributorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/manufacturer"
              element={
                <ProtectedRoute allowedRoles={['MANUFACTURER']}>
                  <ManufacturerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/investigator"
              element={
                <ProtectedRoute allowedRoles={['INVESTIGATOR']}>
                  <InvestigatorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared Intelligence & Feature Pages */}
            <Route
              path="/batches"
              element={
                <ProtectedRoute>
                  <BatchesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/batches/:id"
              element={
                <ProtectedRoute>
                  <BatchDetailView />
                </ProtectedRoute>
              }
            />
            {/* Retailer Operational Routes */}
            <Route
              path="/retailer/inventory"
              element={
                <ProtectedRoute allowedRoles={['RETAILER']}>
                  <RetailerInventoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/retailer/returns"
              element={
                <ProtectedRoute allowedRoles={['RETAILER']}>
                  <RetailerReturnsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/returns"
              element={
                <ProtectedRoute allowedRoles={['RETAILER']}>
                  <RetailerReturnsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/retailer/scan"
              element={
                <ProtectedRoute allowedRoles={['RETAILER']}>
                  <RetailerScanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/retailer/alerts"
              element={
                <ProtectedRoute allowedRoles={['RETAILER']}>
                  <RetailerAlertsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/retailer/return-tracking"
              element={
                <ProtectedRoute allowedRoles={['RETAILER']}>
                  <RetailerReturnTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/handoffs"
              element={<Navigate to="/dashboard/distributor" replace />}
            />

            <Route
              path="/certificates"
              element={
                <ProtectedRoute allowedRoles={['MANUFACTURER']}>
                  <DestructionProofsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <AlertsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/architecture"
              element={
                <ProtectedRoute>
                  <ArchitecturePage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Re-Entry Scanner Modal */}
      <ReentryScannerModal
        isOpen={reentryModalOpen}
        onClose={() => setReentryModalOpen(false)}
        onSuccess={fetchAlerts}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
