import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import TechnicalMimic from "./pages/TechnicalMimic";
import AutoCAD from "./pages/AutoCAD";
import BlindTyping from "./pages/BlindTyping";
import RoboRace from "./pages/RoboRace";
import HackYourWay from "./pages/HackYourWay";
import BridgeBuilding from "./pages/BridgeBuilding";
import PaymentPage from "./pages/PaymentPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/technocratz2.0">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          {/* Per-event registration routes */}
          <Route path="/register/technical-mimic" element={<TechnicalMimic />} />
          <Route path="/register/autocad" element={<AutoCAD />} />
          <Route path="/register/blind-typing" element={<BlindTyping />} />
          <Route path="/register/robo-race" element={<RoboRace />} />
          <Route path="/register/hack-your-way" element={<HackYourWay />} />
          <Route path="/register/bridge-building" element={<BridgeBuilding />} />
          <Route path="/payment" element={<PaymentPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
