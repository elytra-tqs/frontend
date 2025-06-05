import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStationOperator } from '@/contexts/StationOperatorContext';
import { AlertCircle } from 'lucide-react';

export function StationLinker() {
  const {
    availableStations,
    fetchAvailableStations,
    claimStation,
    releaseStation,
    isLoading,
    error
  } = useStationOperator();

  useEffect(() => {
    // Only fetch if we don't have any stations yet
    if (availableStations.length === 0) {
      fetchAvailableStations();
    }
  }, []); // Empty dependency array since we only want to fetch once on mount

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

        {isLoading ? (
          <div className="text-center py-4">Loading available stations...</div>
        ) : availableStations.length > 0 ? (
          <div className="space-y-4">
            {availableStations.map((station) => (
              <Card key={station.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{station.name}</h3>
                      <p className="text-sm text-gray-500">{station.address}</p>
                    </div>
                    <Button
                      onClick={() => claimStation(station.id)}
                      disabled={isLoading}
                    >
                      Claim Station
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No available stations found.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 