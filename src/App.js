import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import AuthPage from './AuthPage';
import UploadPage from './UploadPage';
import DashboardPage from './DashboardPage'
import ResultsDisplay from './ResultsDisplay';
import { AuthProvider } from './AuthContext'; // uncommented
import GeneratorPage from './GeneratorPage';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import BillingPage from './BillingPage';
import SettingsPage from './SettingsPage';
import AnalysesPage from './AnalysesPage';
import UpgradePage from './UpgradePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/analyses" element={<AnalysesPage />} />
          <Route path="/upgrade" element={<UpgradePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/result" element={<ResultsDisplay/>} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/generator" element={<GeneratorPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/checkout" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
