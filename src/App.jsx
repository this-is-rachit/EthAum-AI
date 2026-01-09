import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import AuthPage from "./pages/AuthPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import FounderDashboard from "./pages/FounderDashboard";

// --- LOCAL COMPONENTS ---
function LandingPage() {
  return (
    <main className="w-full relative overflow-hidden">
      <Navbar />
      <Hero />
      <TrendingLaunches />
      <MarketIntelligence />
      <EnterpriseDeals />
      <Footer />
    </main>
  );
}

// --- LOADER MANAGER ---
function AppContent() {
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    
    // 1. SHOW ONLY IF: On Home Page AND Has Not Seen Intro
    if (location.pathname === "/" && !hasSeenIntro) {
      setShowIntro(true);
    } 
    // 2. CRITICAL FIX: FORCE HIDE on any other page (Founders/Auth/Startups)
    else {
      setShowIntro(false);
    }
  }, [location.pathname]);

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem("hasSeenIntro", "true"); 
  };

  return (
    <>
      {/* Only render Loader if state is true */}
      {showIntro && <Loader onComplete={handleIntroComplete} />}

      <AmbientBackground />
      
      <div className={`w-full overflow-x-hidden relative ${showIntro ? 'h-screen overflow-hidden' : ''}`}>
        <SmoothScrollWrapper>
          <Routes>
            {/* 1. Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
            <Route path="/startup/:id" element={<StartupDetails />} />
            
            {/* 2. Protected Founder Route */}
            <Route element={<ProtectedRoute allowedRole="founder" />}>
              <Route path="/founder/dashboard" element={<FounderDashboard />} />
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
    </>
  );
}

// --- MAIN APP EXPORT ---
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}