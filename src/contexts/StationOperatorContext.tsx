import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface Station {
  id: number;
  name: string;
  address: string;
  status?: string;
}

interface StationOperatorContextType {
  availableStations: Station[];
  claimedStation: Station | null;
  fetchAvailableStations: () => Promise<void>;
  fetchClaimedStation: () => Promise<void>;
  claimStation: (stationId: number) => Promise<void>;
  releaseStation: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const StationOperatorContext = createContext<StationOperatorContextType | undefined>(undefined);

interface StationOperatorProviderProps {
  readonly children: React.ReactNode;
}

export function StationOperatorProvider({ children }: StationOperatorProviderProps) {
  const [availableStations, setAvailableStations] = useState<Station[]>([]);
  const [claimedStation, setClaimedStation] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();

  const fetchAvailableStations = useCallback(async () => {
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
  }, [token]);

  const fetchClaimedStation = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First, get the station operator's ID
      const operatorResponse = await fetch(`http://localhost/api/v1/station-operators/user/${user.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!operatorResponse.ok) {
        throw new Error('Failed to fetch operator info');
      }

      const operatorData = await operatorResponse.json();
      
      // Then, get the operator's claimed station
      const stationResponse = await fetch(`http://localhost/api/v1/station-operators/${operatorData.id}/station`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (stationResponse.ok) {
        const station = await stationResponse.json();
        setClaimedStation(station);
      } else {
        setClaimedStation(null);
      }
    } catch (err) {
      console.error('Error fetching claimed station:', err);
      setClaimedStation(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  const claimStation = useCallback(async (stationId: number) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // First, get the station operator's ID
      const operatorResponse = await fetch(`http://localhost/api/v1/station-operators/user/${user.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!operatorResponse.ok) {
        throw new Error('Failed to fetch operator info');
      }

      const operatorData = await operatorResponse.json();
      
      // Then claim the station with the correct operator ID
      const response = await fetch(`http://localhost/api/v1/station-operators/${operatorData.id}/claim-station/${stationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to claim station');
      }

      // Refresh available stations and claimed station after claiming
      await fetchAvailableStations();
      await fetchClaimedStation();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim station');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, user, fetchAvailableStations, fetchClaimedStation]);

  const releaseStation = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // First, get the station operator's ID
      const operatorResponse = await fetch(`http://localhost/api/v1/station-operators/user/${user.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!operatorResponse.ok) {
        throw new Error('Failed to fetch operator info');
      }

      const operatorData = await operatorResponse.json();
      
      // Then release the station with the correct operator ID
      const response = await fetch(`http://localhost/api/v1/station-operators/${operatorData.id}/release-station`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to release station');
      }

      // Refresh available stations after releasing
      await fetchAvailableStations();
      setClaimedStation(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release station');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, user, fetchAvailableStations]);

  return (
    <StationOperatorContext.Provider
      value={{
        availableStations,
        claimedStation,
        fetchAvailableStations,
        fetchClaimedStation,
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