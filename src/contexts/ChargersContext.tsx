import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import axios from "axios";

const api = axios.create({
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  baseURL: "http://localhost:8080/api/v1",
});

export enum ChargerStatus {
  AVAILABLE = "AVAILABLE",
  BEING_USED = "BEING_USED",
  UNDER_MAINTENANCE = "UNDER_MAINTENANCE",
  OUT_OF_SERVICE = "OUT_OF_SERVICE",
}

export interface Charger {
  id: number;
  type: string;
  power: number;
  status: ChargerStatus;
  stationId: number;
}

export interface ChargerFormData {
  type: string;
  power: number;
  status: ChargerStatus;
}

interface ChargersContextType {
  chargers: Charger[];
  loading: boolean;
  error: string | null;
  getChargerAvailability: (chargerId: number) => Promise<ChargerStatus>;
  updateChargerAvailability: (
    chargerId: number,
    status: ChargerStatus
  ) => Promise<void>;
  fetchChargersByAvailability: (status: ChargerStatus) => Promise<void>;
  fetchChargersByStation: (stationId: number) => Promise<void>;
  addChargerToStation: (
    stationId: number,
    chargerData: ChargerFormData
  ) => Promise<void>;
}

const ChargersContext = createContext<ChargersContextType | undefined>(
  undefined
);

export const ChargersProvider = ({ children }: { children: ReactNode }) => {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getChargerAvailability = async (
    chargerId: number
  ): Promise<ChargerStatus> => {
    try {
      const response = await api.get<ChargerStatus>(
        `/chargers/${chargerId}/availability`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get charger availability", error);
      throw error;
    }
  };

  const updateChargerAvailability = async (
    chargerId: number,
    status: ChargerStatus
  ): Promise<void> => {
    try {
      await api.put(
        `/chargers/${chargerId}/availability`,
        JSON.stringify(status),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Update local state
      setChargers((chargers) =>
        chargers.map((charger) =>
          charger.id === chargerId ? { ...charger, status } : charger
        )
      );
    } catch (error) {
      console.error("Failed to update charger availability", error);
      throw error;
    }
  };

  const fetchChargersByAvailability = async (
    status: ChargerStatus
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching chargers by availability", status);
      const response = await api.get<Charger[]>(
        `/chargers/availability/${status}`
      );
      setChargers(response.data);
    } catch (error) {
      console.error("Failed to fetch chargers by availability", error);
      setError("Failed to fetch chargers. Please try again later.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchChargersByStation = async (stationId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Charger[]>(
        `/stations/${stationId}/chargers`
      );
      setChargers(response.data);
    } catch (error) {
      console.error(`Failed to fetch chargers for station ${stationId}`, error);
      setError("Failed to fetch chargers. Please try again later.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addChargerToStation = async (
    stationId: number,
    chargerData: ChargerFormData
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post<Charger>(
        `/stations/${stationId}/chargers`,
        chargerData
      );

      // Add the new charger to the local state
      setChargers((prev) => [...prev, response.data]);
    } catch (error) {
      console.error(`Failed to add charger to station ${stationId}`, error);
      setError("Failed to add charger. Please try again later.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChargersContext.Provider
      value={{
        chargers,
        loading,
        error,
        getChargerAvailability,
        updateChargerAvailability,
        fetchChargersByAvailability,
        fetchChargersByStation,
        addChargerToStation,
      }}
    >
      {children}
    </ChargersContext.Provider>
  );
};

export const useChargers = (): ChargersContextType => {
  const context = useContext(ChargersContext);
  if (!context) {
    throw new Error("useChargers must be used within a ChargersProvider");
  }
  return context;
};
