import { BrowserRouter, Route, Routes } from "react-router-dom";
import StationsPage from './pages/manage_stations/StationsPage';
import StationDetails from './pages/manage_stations/StationDetails';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stations" element={<StationsPage />} />
        <Route path="/stations/:stationId" element={<StationDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

