import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MaintenanceGate from "@/components/cinema/MaintenanceGate";
import HomeEntry from "./pages/HomeEntry.tsx";
import Cookies from "./pages/Cookies.tsx";
import Movies from "./pages/Movies.tsx";
import MovieDetail from "./pages/MovieDetail.tsx";
import Cinemas from "./pages/Cinemas.tsx";
import Admin from "./pages/Admin.tsx";
import Snackbar from "./pages/Snackbar.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MaintenanceGate>
          <Routes>
            <Route path="/" element={<HomeEntry />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/filmes" element={<Movies />} />
            <Route path="/filme/:id" element={<MovieDetail />} />
            <Route path="/cinemas" element={<Cinemas />} />
            <Route path="/snackbar" element={<Snackbar />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MaintenanceGate>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
