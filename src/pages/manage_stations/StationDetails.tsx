import { useParams } from "react-router-dom";

const StationDetails = () => {
  const { stationId } = useParams();

  // TODO: Fetch chargers for this stationId

  return (
    <div>
      <h1>Chargers for Station {stationId}</h1>
      {/* Render chargers here */}
    </div>
  );
};

export default StationDetails;