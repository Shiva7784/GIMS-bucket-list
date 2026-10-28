import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface WeatherData {
    temp?: number;
    condition?: string;
}

export interface Destination {
    _id?: string;
    name: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    weather?: WeatherData;
}

interface DataContextType {
    destinations: Destination[];
    fetchDestinations: () => Promise<void>;
    addDestination: (destination: Omit<Destination, '_id'>) => Promise<void>;
    deleteDestination: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [destinations, setDestinations] = useState<Destination[]>([]);

    const fetchDestinations = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/destinations');
            setDestinations(data);
        } catch (error) {
            console.error('Error fetching destinations:', error);
        }
    };

    const addDestination = async (destination: Omit<Destination, '_id'>) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/destinations', destination);
            setDestinations((prev) => [...prev, data]);
        } catch (error) {
            console.error('Error adding destination:', error);
        }
    };

    const deleteDestination = async (id: string) => {
        try {
            await axios.delete(`http://localhost:5000/api/destinations/${id}`);
            setDestinations((prev) => prev.filter((d) => d._id !== id));
        } catch (error) {
            console.error('Error deleting destination:', error);
        }
    };

    useEffect(() => {
        fetchDestinations();
    }, []);

    return (
        <DataContext.Provider value={{ destinations, fetchDestinations, addDestination, deleteDestination }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
