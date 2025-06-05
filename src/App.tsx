import { BrowserRouter, Route, Routes } from "react-router-dom";
import StationsPage from './pages/manage_stations/StationsPage';
import StationDetails from './pages/manage_stations/StationDetails';
import Dashboard from './pages/Dashboard';
import EVDriverPage from './pages/evdriver/EVDriverPage';
import StationOperatorPage from './pages/station_operator/StationOperatorPage';
import AdminPage from './pages/admin/AdminPage';
import AppLayout from './components/layout/AppLayout';
import { StationsProvider } from "./contexts/StationsContext";
import { ChargersProvider } from "./contexts/ChargersContext";
import { AuthProvider } from "./contexts/AuthContext";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { AddCarPage } from "./pages/evdriver/AddCarPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StationsProvider>
          <ChargersProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protected routes with layout */}
              <Route element={<AppLayout />}>
                {/* EV Driver routes */}
                <Route
                  path="/evdriver"
                  element={
                    <ProtectedRoute allowedUserTypes={["EV_DRIVER"]}>
                      <EVDriverPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/evdriver/add-car"
                  element={
                    <ProtectedRoute allowedUserTypes={["EV_DRIVER"]}>
                      <AddCarPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedUserTypes={["ADMIN"]}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/stations"
                  element={
                    <ProtectedRoute allowedUserTypes={["ADMIN"]}>
                      <StationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/stations/:stationId"
                  element={
                    <ProtectedRoute allowedUserTypes={["ADMIN"]}>
                      <StationDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Station Operator routes */}
                <Route
                  path="/operator"
                  element={
                    <ProtectedRoute allowedUserTypes={["STATION_OPERATOR"]}>
                      <StationOperatorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stations"
                  element={
                    <ProtectedRoute allowedUserTypes={["STATION_OPERATOR"]}>
                      <StationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stations/:stationId"
                  element={
                    <ProtectedRoute allowedUserTypes={["STATION_OPERATOR"]}>
                      <StationDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Dashboard - accessible by all authenticated users */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </ChargersProvider>
        </StationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

