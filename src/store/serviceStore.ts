// src/store/serviceStore.ts
import { create } from 'zustand';
import { serviceAPI } from '@/services/api';

export interface ServiceType {
  _id: string;        // MongoDB ObjectId
  code: string;       // Simple string code like "standard", "deep", etc.
  name: string;       // Display name
  description: string;
  basePrice: number;
  icon?: string;
}

interface ServiceState {
  serviceTypes: ServiceType[];
  isLoading: boolean;
  error: string | null;
  
  fetchServiceTypes: () => Promise<ServiceType[]>;
  getServiceById: (id: string) => ServiceType | undefined;
  getServiceByCode: (code: string) => ServiceType | undefined;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  serviceTypes: [],
  isLoading: false,
  error: null,
  
  fetchServiceTypes: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const serviceTypes = await serviceAPI.getServices();
      set({ serviceTypes, isLoading: false });
      return serviceTypes;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch service types';
      set({ error: errorMessage, isLoading: false });
      return [];
    }
  },
  
  getServiceById: (id: string) => {
    return get().serviceTypes.find(service => service._id === id);
  },
  
  getServiceByCode: (code: string) => {
    return get().serviceTypes.find(service => service.code === code);
  }
}));

export default useServiceStore;