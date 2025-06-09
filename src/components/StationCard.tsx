import { getDistance } from "@/lib/geolocation";
import { useNavigate } from "react-router-dom";

interface StationCardProps {
  station: {
    id: string;
    name: string;
    location?: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    latitude?: number;
    longitude?: number;
  };
  userLocation: [number, number] | null;
  buttonText?: string;
  onButtonClick?: () => void;
}

export const StationCard = ({ 
  station, 
  userLocation, 
  buttonText = "View Details",
  onButtonClick 
}: StationCardProps) => {
  const navigate = useNavigate();
  
  const lat = station.coordinates?.latitude || station.latitude;
  const lon = station.coordinates?.longitude || station.longitude;
  const location = station.location || station.address;
  
  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      navigate(`/stations/${station.id}`);
    }
  };
  
  return (
    <div className="flex flex-col justify-between bg-white rounded-lg shadow p-4 border h-full">
      <div>
        <div className="text-lg font-semibold">{station.name}</div>
        {location && <div className="text-gray-500">{location}</div>}
        {userLocation && lat && lon && (
          <div className="text-sm text-gray-400">
            {getDistance(userLocation, [lat, lon]).toFixed(2)} km away
          </div>
        )}
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={handleClick}
      >
        {buttonText}
      </button>
    </div>
  );
};