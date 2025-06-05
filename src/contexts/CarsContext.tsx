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
  const token = localStorage.getItem('token');
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
  addCar: (carData: CarFormData, driverId?: string) => Promise<Car>;
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
      const response = await carsApiClient.get<Car[]>(`/cars/driver/${driverId}`);
      setCars(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch driver cars');
      console.error('Error fetching driver cars:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCar = useCallback(async (carData: CarFormData, driverId?: string): Promise<Car> => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '/cars';
      
      if (driverId) {
        // If driverId is explicitly provided, use it
        endpoint = `/cars/driver/${driverId}`;
      } else {
        // First, get the current user info to find the driver ID
        try {
          const token = localStorage.getItem('token');
          console.log('Token exists:', !!token);
          
          if (token) {
            const meResponse = await carsApiClient.get('/auth/me');
            console.log('User data from /auth/me:', meResponse.data);
            
            if (meResponse.data && meResponse.data.userId) {

              const oldEndpoint = `/drivers/user/${meResponse.data.userId}`;
              const response = await carsApiClient.get(oldEndpoint);

              console.log(response.data.id)

              // Assuming the user ID is the same as driver ID for EV_DRIVER users
              endpoint = `/cars/driver/${response.data.id}`;
              console.log('Using endpoint:', endpoint);
            }
          }
        } catch (error) {
          console.error('Could not fetch user info:', error);
          console.error('Error details:', error.response?.data);
        }
      }
      
      console.log('Final endpoint:', endpoint);
      console.log('Car data being sent:', carData);


      const response = await carsApiClient.post<Car>(endpoint, carData);
      const newCar = response.data;
      console.log('New car created:', newCar);
      setCars((prevCars) => [...prevCars, newCar]);
      return newCar;
    } catch (err: any) {
      console.error('Error creating car:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to add car';
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