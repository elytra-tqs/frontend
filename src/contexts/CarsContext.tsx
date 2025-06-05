import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import axios from 'axios';

// API client configuration
const API_BASE_URL = 'http://localhost/api/v1';

const carsApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
carsApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface Car {
  id: string;
  model: string;
  licensePlate: string;
  batteryCapacity: number;
  chargerType: string;
  evDriverId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CarFormData {
  model: string;
  licensePlate: string;
  batteryCapacity: number;
  chargerType: string;
}

interface CarsContextType {
  cars: Car[];
  loading: boolean;
  error: string | null;
  fetchCars: () => Promise<void>;
  fetchCarsByDriver: (driverId: string) => Promise<void>;
  addCar: (carData: CarFormData) => Promise<Car>;
  updateCar: (id: string, carData: Partial<CarFormData>) => Promise<Car>;
  deleteCar: (id: string) => Promise<void>;
}

const CarsContext = createContext<CarsContextType | undefined>(undefined);

export const CarsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await carsApiClient.get<Car[]>('/cars');
      setCars(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cars');
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCarsByDriver = useCallback(async (driverId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await carsApiClient.get<Car[]>(`/evdrivers/${driverId}/cars`);
      setCars(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch driver cars');
      console.error('Error fetching driver cars:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCar = useCallback(async (carData: CarFormData): Promise<Car> => {
    setLoading(true);
    setError(null);
    try {
      const response = await carsApiClient.post<Car>('/cars', carData);
      const newCar = response.data;
      setCars((prevCars) => [...prevCars, newCar]);
      return newCar;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add car';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCar = useCallback(async (id: string, carData: Partial<CarFormData>): Promise<Car> => {
    setLoading(true);
    setError(null);
    try {
      const response = await carsApiClient.put<Car>(`/cars/${id}`, carData);
      const updatedCar = response.data;
      setCars((prevCars) =>
        prevCars.map((car) => (car.id === id ? updatedCar : car))
      );
      return updatedCar;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update car';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCar = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await carsApiClient.delete(`/cars/${id}`);
      setCars((prevCars) => prevCars.filter((car) => car.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete car';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: CarsContextType = {
    cars,
    loading,
    error,
    fetchCars,
    fetchCarsByDriver,
    addCar,
    updateCar,
    deleteCar,
  };

  return <CarsContext.Provider value={value}>{children}</CarsContext.Provider>;
};

export const useCars = () => {
  const context = useContext(CarsContext);
  if (context === undefined) {
    throw new Error('useCars must be used within a CarsProvider');
  }
  return context;
};