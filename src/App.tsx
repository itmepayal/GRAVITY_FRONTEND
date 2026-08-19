import { Routes, Route } from "react-router-dom";

import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import ResetPassword from "@/pages/auth/ResetPassword";

import Dashboard from "@/pages/dashboard/Dashboard";
import MyTasks from "@/pages/dashboard/tasks/MyTasks";
import Members from "@/pages/dashboard/members/Members";
import Archived from "@/pages/dashboard/archived/Archived";
import Settings from "@/pages/dashboard/settings/Settings";
import Workspaces from "@/pages/dashboard/workspaces/Workspaces";
import Projects from "./pages/dashboard/projects/Projects";
import Board from "./pages/dashboard/board/Board";
import Sprints from "./pages/dashboard/sprint/Sprints";
import InvitePage from "@/pages/dashboard/invite/Invite";
import Teams from "./pages/dashboard/teams/Teams";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicRoute } from "@/routes/PublicRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/invite/:token" element={<InvitePage />} />

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
          <Route path="/dashboard/workspaces" element={<Workspaces />} />
          <Route path="/dashboard/projects" element={<Projects />} />
          <Route path="/dashboard/boards" element={<Board />} />
          <Route path="/dashboard/sprints" element={<Sprints />} />
          <Route path="/dashboard/tasks" element={<MyTasks />} />
          <Route path="/dashboard/members" element={<Members />} />
          <Route path="/dashboard/teams" element={<Teams />} />
          <Route path="/dashboard/archived" element={<Archived />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
