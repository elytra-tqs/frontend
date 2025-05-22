import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, type FC, useEffect } from 'react';
interface StationDetailsProps {
  stationId: string;
  onClose: () => void;
}

interface UsageData {
  date: string;
  sessions: number;
  totalEnergy: number;
}

interface StationDetails {
  id: string;
  name: string;
  location: string;
  status: 'available' | 'maintenance' | 'offline';
  lastMaintenance: string;
  totalChargers: number;
  activeChargers: number;
  usageData: UsageData[];
}

const StationDetails: FC<StationDetailsProps> = ({ stationId, onClose }) => {
  const [station, setStation] = useState<StationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<StationDetails['status']>('available');



  if (isLoading || !station) {
    return <div className="flex justify-center items-center h-64">Loading station details...</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <CardTitle className="text-2xl">{station.name}</CardTitle>
            <p className="text-muted-foreground">{station.location}</p>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2">Station Status</CardTitle>
              <div className="space-y-2">
                <p>Current Status: <span className="capitalize">{station.status}</span></p>
                <p>Last Maintenance: {station.lastMaintenance}</p>
                <p>Total Chargers: {station.totalChargers}</p>
                <p>Active Chargers: {station.activeChargers}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2">Update Status</CardTitle>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as StationDetails['status'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              <Button
            
                className="w-full mt-2"
              >
                Update Status
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <CardTitle className="text-lg mb-4">Usage Statistics</CardTitle>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={station.usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="sessions" fill="#8884d8" name="Charging Sessions" />
                  <Bar yAxisId="right" dataKey="totalEnergy" fill="#82ca9d" name="Total Energy (kWh)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default StationDetails; 