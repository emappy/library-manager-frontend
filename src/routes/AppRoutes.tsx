import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Books from "../pages/Books";
import Members from "../pages/Members";
import BorrowReturn from "../pages/BorrowReturn";
import AppLayout from "../components/Layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import Staff from "../pages/Staff";
import Reports from "../pages/Reports";
import Genres from "../pages/Genres";
import type { JSX } from "react";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: string[];
}) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="borrow-return" element={<BorrowReturn />} />

          <Route
            path="members"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <Members />
              </RoleRoute>
            }
          />
          <Route
            path="staff"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <Staff />
              </RoleRoute>
            }
          />
          <Route
            path="reports"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <Reports />
              </RoleRoute>
            }
          />
          <Route
            path="genres"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <Genres />
              </RoleRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
