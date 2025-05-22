import { BrowserRouter, Route, Routes } from "react-router-dom";
import StationsPage from './pages/manage_stations/StationsPage';
import StationDetails from './pages/manage_stations/StationDetails';
import Dashboard from './pages/Dashboard';
import EVDriverPage from './pages/evdriver/EVDriverPage';
import OperatorPage from './pages/operator/OperatorPage';
import AppLayout from './components/layout/AppLayout';
import { StationsProvider } from "./contexts/StationsContext";
import { ChargersProvider } from "./contexts/ChargersContext";

function App() {
  return (
    <StationsProvider>
      <ChargersProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route element={<AppLayout />}>
              <Route path="/evdriver" element={<EVDriverPage />} />
              <Route path="/operator" element={<OperatorPage />} />
              <Route path="/operator/stations" element={<StationsPage />} />
              <Route path="/operator/stations/:stationId" element={<StationDetails />} />
              <Route path="/stations" element={<StationsPage />} />
              <Route path="/stations/:stationId" element={<StationDetails />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ChargersProvider>
    </StationsProvider>
  );
}

export default App;

