import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "./layouts/AdminLayout.tsx";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage.tsx";
import { FieldSchedulePage } from "./pages/admin/FieldSchedulePage";
import { MatchmakingPage } from "./pages/admin/MatchmakingPage.tsx";
import { OrdersPage } from "./pages/admin/OrdersPage.tsx";
import { SettingsPage } from "./pages/admin/SettingsPage";
import { TeamsPage } from "./pages/admin/TeamsPage.tsx";
import { LoginPage } from "./pages/auth/LoginPage";
import { LandingPage } from "./pages/LandingPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { BookingPage } from "./pages/user/BookingPage";
import { BookingField } from "./pages/user/BookingField";
import { MatchPage } from "./pages/user/MatchPage";
import { ProfilePage } from "./pages/user/ProfilePage.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/booking/:fieldId" element={<BookingField />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/match" element={<MatchPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route
          path="bookings"
          element={<Navigate to="/admin/orders" replace />}
        />
        <Route path="schedule" element={<FieldSchedulePage />} />
        <Route path="matchmaking" element={<MatchmakingPage />} />
        <Route
          path="calendar"
          element={<Navigate to="/admin/schedule" replace />}
        />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
