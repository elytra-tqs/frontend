import { BrowserRouter, Route, Routes } from "react-router-dom";
import StationsPage from './pages/manage_stations/StationsPage';
import StationDetails from './pages/manage_stations/StationDetails';
import Dashboard from './pages/Dashboard';
import NearbyStations from './pages/NearbyStations';

const stations = [
  {
    id: '1',
    name: 'Aveiro City Center Station',
    location: 'Aveiro City Center, Portugal',
    coordinates: { latitude: 40.6405, longitude: -8.6538 },
  },
  {
    id: '2',
    name: 'Universidade de Aveiro',
    location: 'Universidade de Aveiro, Portugal',
    coordinates: { latitude: 40.6302, longitude: -8.6576 },
  },
  {
    id: '3',
    name: 'Forum Aveiro Station',
    location: 'Forum Aveiro, Portugal',
    coordinates: { latitude: 40.6412, longitude: -8.6531 },
  },
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stations" element={<StationsPage />} />
        <Route path="/stations/:stationId" element={<StationDetails />} />
        <Route path="/nearby" element={<NearbyStations stations={stations} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

