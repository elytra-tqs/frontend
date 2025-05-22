import { BrowserRouter, Route, Routes } from "react-router-dom";
import StationsPage from './pages/manage_stations/StationsPage';
import StationDetails from './pages/manage_stations/StationDetails';
import Dashboard from './pages/Dashboard';
import EVDriverPage from './pages/evdriver/EVDriverPage';
import OperatorPage from './pages/operator/OperatorPage';
import { StationsProvider } from "./contexts/StationsContext";
import { ChargersProvider } from "./contexts/ChargersContext";

function App() {
  return (
    <StationsProvider>
      <ChargersProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* EV Driver Routes */}
            <Route path="/evdriver" element={<EVDriverPage />} />
            
            {/* Operator Routes */}
            <Route path="/operator" element={<OperatorPage />} />
            <Route path="/operator/stations" element={<StationsPage />} />
            <Route path="/operator/stations/:stationId" element={<StationDetails />} />
            
            {/* Redirect old routes for backward compatibility */}
            <Route path="/stations" element={<StationsPage />} />
            <Route path="/stations/:stationId" element={<StationDetails />} />
          </Routes>
        </BrowserRouter>
      </ChargersProvider>
    </StationsProvider>
  );
}

export default App;

