import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Practice from "./pages/Practice";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import ClubsSignIn from "./components/ClubsSignIn";
import ClubDashboard from "./components/ClubDashboard";
import StudentSignIn from "./components/StudentSignIn";
import StudentRegister from "./components/StudentRegister";
import PrivateRoute, { StudentOnlyRoute } from "./components/PrivateRoute";
import AdminRoute from "@/components/admin/AdminRoute";
import AdminSignIn from "./components/admin/AdminSignIn";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import { AgentDataProvider } from "./context/AgentDataContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AgentDataProvider>
      <Toaster />
      <Sonner />

      <Routes>
        <Route path="/" element={<Index />} />
        <Route
          path="/practice"
          element={
            // <StudentOnlyRoute>
            <Practice />
            // </StudentOnlyRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="/admin/signin" element={<PublicOnlyRoute><AdminSignIn /></PublicOnlyRoute>} />
        <Route path="/club/signin" element={<PublicOnlyRoute><ClubsSignIn /></PublicOnlyRoute>} />
        <Route path="/club/dashboard" element={<PrivateRoute><ClubDashboard /></PrivateRoute>} />
        <Route path="/student/signin" element={<PublicOnlyRoute><StudentSignIn /></PublicOnlyRoute>} />
        <Route path="/student/register" element={<PublicOnlyRoute><StudentRegister /></PublicOnlyRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>

    </AgentDataProvider>
  </QueryClientProvider>
);

export default App;
