import { BrowserRouter, Route, Routes } from "react-router-dom";
import StationsPage from './pages/manage_stations/StationsPage';
import StationDetails from './pages/manage_stations/StationDetails';
import Dashboard from './pages/Dashboard';
import { StationsProvider } from "./contexts/StationsContext";
import { ChargersProvider } from "./contexts/ChargersContext";

function App() {
  return (
    <StationsProvider>
      <ChargersProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stations" element={<StationsPage />} />
            <Route path="/stations/:stationId" element={<StationDetails />} />
          </Routes>
        </BrowserRouter>
      </ChargersProvider>
    </StationsProvider>
  );
}

export default App;

