import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  baseURL: "http://localhost/api/v1",
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Station {
  id?: number;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  chargerTypes?: string[];
  status?: "available" | "maintenance" | "offline";
  lastMaintenance?: string;
  numberOfChargers?: number;
}

export interface StationFormData {
  name: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  chargerTypes?: string[];
  status?: "available" | "maintenance" | "offline";
  lastMaintenance?: string;
}

interface StationsContextProps {
  stations: Station[];
  loading: boolean;
  error: string | null;
  fetchStations: () => void;
  registerStation: (stationData: StationFormData) => Promise<void>;
  updateStation: (stationId: number, stationData: StationFormData) => Promise<void>;
  deleteStation: (stationId: number) => Promise<void>;
}

const StationsContext = createContext<StationsContextProps | undefined>(
  undefined
);

export const StationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/stations");
      setStations(response.data as Station[]);
    } catch (error) {
      console.error("Failed to fetch stations", error);
      setError("Failed to load stations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const registerStation = async (stationData: StationFormData) => {
    try {
      setLoading(true);
      setError(null);

      const backendStation: Station = {
        name: stationData.name,
        address: stationData.location,
        latitude: stationData.coordinates.latitude,
        longitude: stationData.coordinates.longitude,
      };

      const response = await api.post("/stations", backendStation);

      const newStation: Station = Object.assign({}, response.data, {
        name: stationData.name,
        address: stationData.location,
        status: "available" as "available",
        lastMaintenance: new Date().toISOString(),
        numberOfChargers: 0,
      });

      setStations((prev) => [...prev, newStation]);
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to register station", error);
      setError("Failed to register station. Please try again.");
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStation = async (stationId: number, stationData: StationFormData) => {
    try {
      setLoading(true);
      setError(null);

      const backendStation: Station = {
        id: stationId,
        name: stationData.name,
        address: stationData.location,
        latitude: stationData.coordinates.latitude,
        longitude: stationData.coordinates.longitude,
      };

      const response = await api.put<Station>(`/stations/${stationId}`, backendStation);

      setStations((prev) =>
        prev.map((station) =>
          station.id === stationId ? response.data : station
        )
      );
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to update station", error);
      setError("Failed to update station. Please try again.");
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteStation = async (stationId: number) => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/stations/${stationId}`);
      setStations((prev) => prev.filter((station) => station.id !== stationId));
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to delete station", error);
      setError("Failed to delete station. Please try again.");
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  return (
    <StationsContext.Provider
      value={{ stations, loading, error, fetchStations, registerStation, updateStation, deleteStation }}
    >
      {children}
    </StationsContext.Provider>
  );
};

export const useStations = (): StationsContextProps => {
  const context = useContext(StationsContext);
  if (!context) {
    throw new Error("useStations must be used within a StationsProvider");
  }
  return context;
};
