import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import EntryPage from "./pages/EntryPage";
import ProductionPage from "./pages/ProductionPage";
import OutputPage from "./pages/OutputPage";
import HistoryPage from "./pages/HistoryPage";
import AdminPanel from "./pages/AdminPanel";
import InventoryPage from "./pages/InventoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/entrada" element={
              <ProtectedRoute>
                <EntryPage />
              </ProtectedRoute>
            } />
            <Route path="/produccion" element={
              <ProtectedRoute>
                <ProductionPage />
              </ProtectedRoute>
            } />
            <Route path="/salida" element={
              <ProtectedRoute>
                <OutputPage />
              </ProtectedRoute>
            } />
            <Route path="/historial" element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/inventario" element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
