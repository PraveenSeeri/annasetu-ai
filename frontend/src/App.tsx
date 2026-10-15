import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { RoleNav } from './components/RoleNav';
import { FoodSafetyBanner } from './components/FoodSafetyBanner';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AIAssistantModal } from './components/AIAssistantModal';

// Public pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ImpactPage } from './pages/public/ImpactPage';
import { AboutPage } from './pages/public/AboutPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { TermsPage } from './pages/public/TermsPage';

// Donor pages
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { DonorListings } from './pages/donor/DonorListings';
import { NewListingPage } from './pages/donor/NewListingPage';
import { ListingDetailPage } from './pages/donor/ListingDetailPage';
import { DonorHistory } from './pages/donor/DonorHistory';
import { DonorProfile } from './pages/donor/DonorProfile';

// Recipient pages
import { RecipientDashboard } from './pages/recipient/RecipientDashboard';
import { RecipientDonations } from './pages/recipient/RecipientDonations';
import { RecipientRequests } from './pages/recipient/RecipientRequests';
import { RecipientPickups } from './pages/recipient/RecipientPickups';
import { RecipientHistory } from './pages/recipient/RecipientHistory';
import { RecipientProfile } from './pages/recipient/RecipientProfile';

// Volunteer pages
import { VolunteerDashboard } from './pages/volunteer/VolunteerDashboard';
import { VolunteerTasks } from './pages/volunteer/VolunteerTasks';
import { VolunteerTaskDetail } from './pages/volunteer/VolunteerTaskDetail';
import { VolunteerProfile } from './pages/volunteer/VolunteerProfile';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrganizations } from './pages/admin/AdminOrganizations';
import { AdminVerifications } from './pages/admin/AdminVerifications';
import { AdminListings } from './pages/admin/AdminListings';
import { AdminPickups } from './pages/admin/AdminPickups';
import { AdminSafetyReports } from './pages/admin/AdminSafetyReports';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminUsers } from './pages/admin/AdminUsers';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
          <FoodSafetyBanner />
          <Navbar />
          <RoleNav />

          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/impact" element={<ImpactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Donor Routes */}
              <Route
                path="/donor"
                element={
                  <ProtectedRoute allowedRoles={['donor']}>
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['donor']}>
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/listings"
                element={
                  <ProtectedRoute allowedRoles={['donor']}>
                    <DonorListings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/listings/new"
                element={
                  <ProtectedRoute allowedRoles={['donor']}>
                    <NewListingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/listings/:id"
                element={
                  <ProtectedRoute allowedRoles={['donor', 'admin']}>
                    <ListingDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/history"
                element={
                  <ProtectedRoute allowedRoles={['donor']}>
                    <DonorHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/profile"
                element={
                  <ProtectedRoute allowedRoles={['donor']}>
                    <DonorProfile />
                  </ProtectedRoute>
                }
              />

              {/* Recipient Routes */}
              <Route
                path="/recipient"
                element={
                  <ProtectedRoute allowedRoles={['recipient']}>
                    <RecipientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipient/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['recipient']}>
                    <RecipientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipient/donations"
                element={
                  <ProtectedRoute allowedRoles={['recipient']}>
                    <RecipientDonations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipient/requests"
                element={
                  <ProtectedRoute allowedRoles={['recipient']}>
                    <RecipientRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipient/pickups"
                element={
                  <ProtectedRoute allowedRoles={['recipient']}>
                    <RecipientPickups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipient/history"
                element={
                  <ProtectedRoute allowedRoles={['recipient']}>
                    <RecipientHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipient/profile"
                element={
                  <ProtectedRoute allowedRoles={['recipient']}>
                    <RecipientProfile />
                  </ProtectedRoute>
                }
              />

              {/* Volunteer Routes */}
              <Route
                path="/volunteer"
                element={
                  <ProtectedRoute allowedRoles={['volunteer']}>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['volunteer']}>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer/tasks"
                element={
                  <ProtectedRoute allowedRoles={['volunteer']}>
                    <VolunteerTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer/tasks/:id"
                element={
                  <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                    <VolunteerTaskDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer/profile"
                element={
                  <ProtectedRoute allowedRoles={['volunteer']}>
                    <VolunteerProfile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/organizations"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminOrganizations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/verifications"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminVerifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/listings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminListings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pickups"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPickups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/safety-reports"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSafetyReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAuditLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* AI Assistant Co-pilot Modal */}
          <AIAssistantModal />

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
