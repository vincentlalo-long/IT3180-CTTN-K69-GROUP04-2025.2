import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "./layouts/admin/AdminLayout.tsx";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage.tsx";
import { FieldSchedulePage } from "./pages/admin/FieldSchedulePage";
import { MatchmakingPage } from "./pages/admin/MatchmakingPage.tsx";
import { LeaguePage } from "./pages/admin/LeaguePage.tsx";
import { OrdersPage } from "./pages/admin/OrdersPage.tsx";
import { SettingsPage } from "./pages/admin/SettingsPage";
import { TeamsPage } from "./pages/admin/TeamsPage.tsx";
import { LoginPage } from "./pages/auth/LoginPage";
import { LandingPage } from "./pages/LandingPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { BookingPage } from "./pages/player/BookingPage.tsx";
import { BookingField } from "./pages/player/BookingField.tsx";
import { MatchPage } from "./pages/player/MatchPage.tsx";
import { ProfilePage } from "./pages/player/ProfilePage.tsx";
import { PlayerTeamPage } from "./pages/player/PlayerTeamPage.tsx";
import { PlayerLeaguePage } from "./pages/player/PlayerLeaguePage.tsx";
import { CheckoutPage } from "./pages/player/CheckoutPage.tsx";
import { PaymentResultPage } from "./pages/player/PaymentResultPage.tsx";
import { ForbiddenPage } from "./pages/ForbiddenPage";
import { AdminProtectedRoute } from "./features/auth/components/AdminProtectedRoute";
import { ToastContainer } from "./shared/components/Toast/Toast.tsx";

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/booking/:fieldId" element={<BookingField />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/match" element={<MatchPage />} />
        <Route path="/team" element={<PlayerTeamPage />} />
        <Route path="/leagues" element={<PlayerLeaguePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/vnpay-return" element={<PaymentResultPage />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route
            path="bookings"
            element={<Navigate to="/admin/orders" replace />}
          />
          <Route path="schedule" element={<FieldSchedulePage />} />
          <Route path="matchmaking" element={<MatchmakingPage />} />
          <Route path="leagues" element={<LeaguePage />} />
          <Route
            path="calendar"
            element={<Navigate to="/admin/schedule" replace />}
          />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;