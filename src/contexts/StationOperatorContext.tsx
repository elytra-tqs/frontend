import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

interface Station {
  id: number;
  name: string;
  address: string;
  status?: string;
}

interface StationOperatorContextType {
  availableStations: Station[];
  fetchAvailableStations: () => Promise<void>;
  claimStation: (stationId: number) => Promise<void>;
  releaseStation: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const StationOperatorContext = createContext<StationOperatorContextType | undefined>(undefined);

export function StationOperatorProvider({ children }: { children: React.ReactNode }) {
  const [availableStations, setAvailableStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchAvailableStations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('http://localhost/api/v1/station-operators/available-stations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available stations');
      }

      const data = await response.json();
      setAvailableStations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available stations');
    } finally {
      setIsLoading(false);
    }
  };

  const claimStation = async (stationId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`http://localhost/api/v1/station-operators/1/claim-station/${stationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to claim station');
      }

      // Refresh available stations after claiming
      await fetchAvailableStations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim station');
    } finally {
      setIsLoading(false);
    }
  };

  const releaseStation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('http://localhost/api/v1/station-operators/1/release-station', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to release station');
      }

      // Refresh available stations after releasing
      await fetchAvailableStations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release station');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StationOperatorContext.Provider
      value={{
        availableStations,
        fetchAvailableStations,
        claimStation,
        releaseStation,
        isLoading,
        error,
      }}
    >
      {children}
    </StationOperatorContext.Provider>
  );
}

export function useStationOperator() {
  const context = useContext(StationOperatorContext);
  if (context === undefined) {
    throw new Error('useStationOperator must be used within a StationOperatorProvider');
  }
  return context;
} 