import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import StationsPage from './pages/manage_stations/StationsPage';
import StationDetails from './pages/manage_stations/StationDetails';
import EVDriverPage from './pages/evdriver/EVDriverPage';
import StationOperatorPage from './pages/station_operator/StationOperatorPage';
import AdminPage from './pages/admin/AdminPage';
import AppLayout from './components/layout/AppLayout';
import { StationsProvider } from "./contexts/StationsContext";
import { ChargersProvider } from "./contexts/ChargersContext";
import { CarsProvider } from "./contexts/CarsContext";
import { BookingsProvider } from "./contexts/BookingsContext";
import { AuthProvider } from "./contexts/AuthContext";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { AddCarPage } from "./pages/evdriver/AddCarPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { StationOperatorProvider } from './contexts/StationOperatorContext';
import { Toaster } from "sonner";

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <AuthProvider>
        <CarsProvider>
          <StationsProvider>
          <ChargersProvider>
            <BookingsProvider>
              <StationOperatorProvider>
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
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        {({ userType }) => {
                          switch (userType) {
                            case "ADMIN":
                              return <Navigate to="/admin" replace />;
                            case "EV_DRIVER":
                              return <Navigate to="/evdriver" replace />;
                            case "STATION_OPERATOR":
                              return <Navigate to="/operator" replace />;
                            default:
                              return <Navigate to="/signin" replace />;
                          }
                        }}
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Routes>
              </StationOperatorProvider>
            </BookingsProvider>
            </ChargersProvider>
          </StationsProvider>
        </CarsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

