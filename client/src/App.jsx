import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/auth/hooks/useAuth";
import Login from "./features/auth/pages/Login";
import AdminLayout from "./components/Layout/AdminLayout";
import { ProtectedRoute } from "./components/Layout/ProtectedRoute";
import AnalyticsDashboard from "./features/analytics/pages/AnalyticsDashboard";
import CarTypesPage from "./features/car/pages/CarTypesPage";
import CarModelsPage from "./features/car/pages/CarModelsPage";
import CarList from "./features/car/pages/CarList";
import OrderList from "./features/order/pages/OrderList";
import { ToastProvider } from "./components/Common/UI/ToastProvider";

const CarTypes = () => <CarTypesPage />;
const CarModels = () => <CarModelsPage />;
const Cars = () => <CarList />;
const Orders = () => <OrderList />;

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AnalyticsDashboard />} />
            <Route path="cars" element={<Cars />} />
            <Route path="orders" element={<Orders />} />
            <Route path="car-types" element={<CarTypes />} />
            <Route path="car-models" element={<CarModels />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
