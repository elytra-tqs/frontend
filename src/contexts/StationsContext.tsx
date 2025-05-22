import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  baseURL: 'http://localhost:8080/api/v1'
});

export interface Station {
    id?: number;
    name: string;
    address: string; 
    latitude?: number; 
    longitude?: number;
    numberOfChargers?: number; 
    chargerTypes?: string[]; 
    status?: 'available' | 'maintenance' | 'offline'; 
    lastMaintenance?: string;
}

export interface StationFormData {
    name: string;
    location: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    numberOfChargers: number;
    chargerTypes?: string[];
    status?: 'available' | 'maintenance' | 'offline';
    lastMaintenance?: string;
}

interface StationsContextProps {
    stations: Station[];
    loading: boolean;
    error: string | null;
    fetchStations: () => void;
    registerStation: (stationData: StationFormData) => Promise<void>;
}

const StationsContext = createContext<StationsContextProps | undefined>(undefined);

export const StationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStations = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/stations');
            setStations(response.data);
        } catch (error) {
            console.error('Failed to fetch stations', error);
            setError('Failed to load stations. Please try again later.');
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
                longitude: stationData.coordinates.longitude
            };
            
            const response = await api.post('/stations', backendStation);
            
            const newStation: Station = {
                ...response.data,
                status: 'available',
                lastMaintenance: new Date().toISOString()
            };
            
            setStations((prev) => [...prev, newStation]);
            return Promise.resolve();
        } catch (error) {
            console.error('Failed to register station', error);
            setError('Failed to register station. Please try again.');
            return Promise.reject(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    return (
        <StationsContext.Provider value={{ stations, loading, error, fetchStations, registerStation }}>
            {children}
        </StationsContext.Provider>
    );
};

export const useStations = (): StationsContextProps => {
    const context = useContext(StationsContext);
    if (!context) {
        throw new Error('useStations must be used within a StationsProvider');
    }
    return context;
};