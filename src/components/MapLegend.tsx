export const MapLegend = () => (
  <div className="absolute bottom-5 left-5 bg-white p-4 rounded-lg shadow-md text-sm z-[1000]">
    <div className="flex items-center mb-2">
      <img
        src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
        alt="User"
        className="w-5 mr-2"
      />
      <span>Your Location</span>
    </div>
    <div className="flex items-center">
      <img
        src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
        alt="Station"
        className="w-5 mr-2"
      />
      <span>Charging Station</span>
    </div>
  </div>
);