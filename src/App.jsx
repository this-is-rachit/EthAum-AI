import { useState } from "react";
import Navbar from "./components/NavBar";
import SmoothScrollWrapper from "./components/SmoothScrollWrapper";
import { CustomCursor, AmbientBackground } from "./components/UIEffects";
import Hero from "./components/Hero";
import SmartDashboard from "./components/SmartDashboard";
import TrendingLaunches from "./components/TrendingLaunches";
import MarketIntelligence from "./components/MarketIntelligence";
import EnterpriseDeals from "./components/EnterpriseDeals";
import Footer from "./components/Footer";
import Loader from "./components/Loader";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <Loader onComplete={() => setIsLoading(false)} />}

      <div className={`${isLoading ? 'h-screen overflow-hidden' : ''}`}> 
        <SmoothScrollWrapper>
          
          <AmbientBackground />
          <CustomCursor />
          
          <Navbar />

          <Hero />
          
          {/* STACKED SECTIONS */}
          {/* They will stack nicely because they have solid backgrounds now */}
          <SmartDashboard />      
          <TrendingLaunches />    
          <MarketIntelligence />  
          <EnterpriseDeals />     
            
          {/* FOOTER */}
          {/* No spacer needed, it will just appear after the last card */}
          <Footer />

        </SmoothScrollWrapper>
      </div>
    </>
  );
}