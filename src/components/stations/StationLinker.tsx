import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Station {
  id: number;
  name: string;
  address: string;
  status?: string;
}

interface StationLinkerProps {
  stations: Station[];
  onClaimStation: (stationId: number) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function StationLinker({ stations, onClaimStation, isLoading = false, error }: StationLinkerProps) {
  const renderStations = () => {
    if (isLoading) {
      return <div className="text-center py-4">Loading available stations...</div>;
    }
    if (stations.length === 0) {
      return <div className="text-center py-4 text-gray-500">No available stations found.</div>;
    }
    return (
      <div className="space-y-4">
        {stations.map((station) => (
          <Card key={station.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{station.name}</h3>
                  <p className="text-sm text-gray-500">{station.address}</p>
                </div>
                <Button
                  onClick={() => onClaimStation(station.id)}
                  disabled={isLoading}
                >
                  Claim Station
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Stations</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        {renderStations()}
      </CardContent>
    </Card>
  );
} 