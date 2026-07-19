import { Routes, Route } from "react-router-dom";

import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import ResetPassword from "@/pages/auth/ResetPassword";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Dashboard from "@/pages/dashboard/Dashboard";
import MyTasks from "@/pages/dashboard/tasks/MyTasks";
import Members from "@/pages/dashboard/members/Members";
import Archived from "@/pages/dashboard/archived/Archived";
import Settings from "@/pages/dashboard/settings/Settings";

import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicRoute } from "@/routes/PublicRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/tasks" element={<MyTasks />} />
          <Route path="/dashboard/members" element={<Members />} />
          <Route path="/dashboard/archived" element={<Archived />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
