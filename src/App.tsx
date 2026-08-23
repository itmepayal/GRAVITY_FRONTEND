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
import Role from "./pages/dashboard/role/Role";
import ActivityLog from "./pages/dashboard/activity-log/ActivityLog";
import BackLog from "./pages/dashboard/backlog/BackLog";
import Calendar from "./pages/dashboard/calendar/Calendar";
import TimeLine from "./pages/dashboard/timeline/TimeLine";
import Goal from "./pages/dashboard/goal/Goal";
import TimeTracking from "./pages/dashboard/time-tracking/TimeTracking";
import Files from "./pages/dashboard/files/FIles";
import Documents from "./pages/dashboard/documents/Documents";
import Reports from "./pages/dashboard/reports/Reports";
import Inbox from "./pages/dashboard/inbox/Inbox";
import Analytics from "./pages/dashboard/analytics/Analytics";
import Notification from "./pages/dashboard/notification/Notification";

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
          <Route path="/dashboard/roles" element={<Role />} />
          <Route path="/dashboard/activity-log" element={<ActivityLog />} />
          <Route path="/dashboard/backlog" element={<BackLog />} />
          <Route path="/dashboard/calendar" element={<Calendar />} />
          <Route path="/dashboard/goals" element={<Goal />} />
          <Route path="/dashboard/time-tracking" element={<TimeTracking />} />
          <Route path="/dashboard/archived" element={<Archived />} />
          <Route path="/dashboard/timeline" element={<TimeLine />} />
          <Route path="/dashboard/files" element={<Files />} />
          <Route path="/dashboard/documents" element={<Documents />} />
          <Route path="/dashboard/inbox" element={<Inbox />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/notifications" element={<Notification />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
