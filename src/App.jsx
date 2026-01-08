import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/NavBar";
import SmoothScrollWrapper from "./components/SmoothScrollWrapper";
import { AmbientBackground } from "./components/UIEffects";
import Hero from "./components/Hero";
import TrendingLaunches from "./components/TrendingLaunches";
import MarketIntelligence from "./components/MarketIntelligence";
import EnterpriseDeals from "./components/EnterpriseDeals";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import ProtectedRoute from "./components/ProtectedRoute";
import StartupDetails from "./pages/StartupDetails";
import BuyerDashboard from "./pages/BuyerDashboard";

// --- PAGE IMPORTS ---
// Ensure these files exist in src/pages/ or change the path to src/components/
import AuthPage from "./pages/AuthPage";
import FounderDashboard from "./pages/FounderDashboard";

// --- LOCAL COMPONENTS ---
function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrendingLaunches />
      <MarketIntelligence />
      <EnterpriseDeals />
      <Footer />
    </>
  );
}


// --- MAIN APP EXPORT ---
export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <AuthProvider>
      <BrowserRouter>
        {isLoading && <Loader onComplete={() => setIsLoading(false)} />}

        {/* Global Background */}
        <AmbientBackground />

        <div className={`${isLoading ? 'h-screen overflow-hidden' : ''}`}>
          <SmoothScrollWrapper>
            <Routes>
              {/* 1. Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/startup/:id" element={<StartupDetails />} />
              {/* 2. Protected Founder Route */}
              <Route element={<ProtectedRoute allowedRole="founder" />}>
                <Route path="/founder/dashboard" element={<FounderDashboard />} />
              </Route>
              <Route element={<ProtectedRoute allowedRole="buyer" />}>
                <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
              </Route>

              {/* 3. Protected Buyer Route */}
              <Route element={<ProtectedRoute allowedRole="buyer" />}>
                <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
              </Route>


              {/* 4. Catch-All */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </SmoothScrollWrapper>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}