// src/store/bookingStore.ts
import { create } from 'zustand';
import { persist, PersistStorage, StorageValue } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { bookingAPI } from '@/services/api';

// Define interfaces for the data structures
interface ServiceData {
  serviceId: string;
  serviceName: string;
  serviceDescription: string;
  basePrice: number;
  serviceCode?: string;
}

interface AddressData {
  addressId: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  squareFootage: number;
  notes?: string;
}

interface DateTimeData {
  date: string;
  timeSlot: string;
  preferredDates: string[];
  preferredTimeSlots: string[];
  flexibleScheduling: boolean;
}

interface BookingDetails {
  hasPets?: boolean;
  messiness?: number;
  supplies?: 'customer' | 'cleaner';
  frequency?: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  notes?: string;
  suppliesOption?: string;
  selectedSupplies?: string[];
  suppliesDiscount?: number;
  bedCount?: number;
  bathCount?: number;
}

export interface CurrentBooking {
  serviceId: string | null;
  serviceName: string | null;
  serviceDescription: string | null;
  basePrice: number | null;
  
  addressId: string | null;
  addressName: string | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  squareFootage: number | null;
  
  date: string | null;
  timeSlot: string | null;
  preferredDates: string[];
  preferredTimeSlots: string[];
  
  cleanerId: string | null;
  
  hasPets: boolean;
  messiness: number;
  supplies: 'customer' | 'cleaner';
  flexibleScheduling: boolean;
  frequency: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  notes: string;
  bedCount?: number;
  bathCount?: number;
  
  estimatedPrice: number | null;
}

interface BookingState {
  currentBooking: CurrentBooking;
  bookings: any[];
  isLoading: boolean;
  error: string | null;
  
  setService: (serviceData: ServiceData) => void;
  setAddress: (addressData: AddressData) => void;
  setDateTime: (dateTimeData: DateTimeData) => void;
  setCleaner: (cleanerId: string | null) => void;
  setDetails: (details: BookingDetails) => void;
  
  syncFromCookies: () => void; // New function to sync from individual cookies
  createBooking: () => Promise<boolean>;
  getUserBookings: () => Promise<any[]>;
  rescheduleBooking: (bookingId: string, date: string, timeSlot: string) => Promise<boolean>;
  resetCurrentBooking: () => void;
}

// Create a custom storage adapter that uses js-cookie.
const cookieStorage: PersistStorage<BookingState> = {
  getItem: (name: string) => {
    const value = Cookies.get(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: StorageValue<BookingState>) => {
    Cookies.set(name, JSON.stringify(value), { expires: 7 });
  },
  removeItem: (name: string) => {
    Cookies.remove(name);
  },
};

// Helper function to parse cookies safely
const safelyParseCookie = (cookieName: string) => {
  try {
    const cookieValue = Cookies.get(cookieName);
    return cookieValue ? JSON.parse(cookieValue) : null;
  } catch (error) {
    console.error(`Error parsing cookie ${cookieName}:`, error);
    return null;
  }
};

export const useBookingStore = create<BookingState>()(
  persist<BookingState>(
    (set, get) => ({
      currentBooking: {
        serviceId: null,
        serviceName: null,
        serviceDescription: null,
        basePrice: null,
        
        addressId: null,
        addressName: null,
        streetAddress: null,
        city: null,
        state: null,
        zipCode: null,
        squareFootage: null,
        
        date: null,
        timeSlot: null,
        preferredDates: [],
        preferredTimeSlots: [],
        
        cleanerId: null,
        
        hasPets: false,
        messiness: 5,
        supplies: 'cleaner',
        flexibleScheduling: false,
        frequency: 'one-time',
        notes: '',
        
        estimatedPrice: null,
      },
      
      bookings: [],
      isLoading: false,
      error: null,
      
      // Sync all individual cookies into the store
      syncFromCookies: () => {
        try {
          // Try to get service data
          const serviceData = safelyParseCookie('bookingService');
          // Try to get address data
          const addressData = safelyParseCookie('bookingAddress');
          // Try to get date time data
          const dateTimeData = safelyParseCookie('bookingDateTime');
          
          // Current state
          const currentState = get().currentBooking;
          
          // Build updated state
          const updatedBooking = {
            ...currentState,
          };
          
          // Update with service data if available
          if (serviceData) {
            updatedBooking.serviceId = serviceData.serviceId || currentState.serviceId;
            updatedBooking.serviceName = serviceData.serviceName || currentState.serviceName;
            updatedBooking.serviceDescription = serviceData.serviceDescription || currentState.serviceDescription;
            updatedBooking.basePrice = serviceData.basePrice || currentState.basePrice;
            updatedBooking.estimatedPrice = serviceData.basePrice || currentState.estimatedPrice;
          }
          
          // Update with address data if available
          if (addressData) {
            updatedBooking.addressId = addressData.addressId || currentState.addressId;
            updatedBooking.addressName = addressData.name || currentState.addressName;
            updatedBooking.streetAddress = addressData.streetAddress || currentState.streetAddress;
            updatedBooking.city = addressData.city || currentState.city;
            updatedBooking.state = addressData.state || currentState.state;
            updatedBooking.zipCode = addressData.zipCode || currentState.zipCode;
            updatedBooking.squareFootage = addressData.squareFootage || currentState.squareFootage;
          }
          
          // Update with date time data if available
          if (dateTimeData) {
            updatedBooking.date = dateTimeData.date || currentState.date;
            updatedBooking.timeSlot = dateTimeData.timeSlot || currentState.timeSlot;
            updatedBooking.preferredDates = dateTimeData.preferredDates || currentState.preferredDates;
            updatedBooking.preferredTimeSlots = dateTimeData.preferredTimeSlots || currentState.preferredTimeSlots;
            updatedBooking.flexibleScheduling = dateTimeData.flexibleScheduling !== undefined ? 
              dateTimeData.flexibleScheduling : currentState.flexibleScheduling;
          }
          
          // Set the updated state
          set({ currentBooking: updatedBooking });
          
        } catch (error) {
          console.error('Error syncing from cookies:', error);
        }
      },
      
      setService: (serviceData: ServiceData) => {
        set((state) => ({
          currentBooking: {
            ...state.currentBooking,
            serviceId: serviceData.serviceId,
            serviceName: serviceData.serviceName,
            serviceDescription: serviceData.serviceDescription,
            basePrice: serviceData.basePrice,
            estimatedPrice: serviceData.basePrice, // Initially set estimated to base price
          }
        }));
        
        // Also set the cookie directly for redundancy
        Cookies.set('bookingService', JSON.stringify(serviceData), { expires: 7 });
      },
      
      setAddress: (addressData: AddressData) => {
        set((state) => ({
          currentBooking: {
            ...state.currentBooking,
            addressId: addressData.addressId,
            addressName: addressData.name,
            streetAddress: addressData.streetAddress,
            city: addressData.city,
            state: addressData.state,
            zipCode: addressData.zipCode,
            squareFootage: addressData.squareFootage,
          }
        }));
        
        // Also set the cookie directly for redundancy
        Cookies.set('bookingAddress', JSON.stringify(addressData), { expires: 7 });
      },
      
      setDateTime: (dateTimeData: DateTimeData) => {
        set((state) => ({
          currentBooking: {
            ...state.currentBooking,
            date: dateTimeData.date,
            timeSlot: dateTimeData.timeSlot,
            preferredDates: dateTimeData.preferredDates || [],
            preferredTimeSlots: dateTimeData.preferredTimeSlots || [],
            flexibleScheduling: dateTimeData.flexibleScheduling || false,
          }
        }));
        
        // Also set the cookie directly for redundancy
        Cookies.set('bookingDateTime', JSON.stringify(dateTimeData), { expires: 7 });
      },
      
      setCleaner: (cleanerId: string | null) => set((state) => ({
        currentBooking: {
          ...state.currentBooking,
          cleanerId,
        }
      })),
      
      setDetails: (details: BookingDetails) => set((state) => ({
        currentBooking: {
          ...state.currentBooking,
          hasPets: details.hasPets !== undefined ? details.hasPets : state.currentBooking.hasPets,
          messiness: details.messiness !== undefined ? details.messiness : state.currentBooking.messiness,
          supplies: details.supplies || state.currentBooking.supplies,
          frequency: details.frequency || state.currentBooking.frequency,
          notes: details.notes !== undefined ? details.notes : state.currentBooking.notes,
          bedCount: details.bedCount,
          bathCount: details.bathCount, 
        }
      })),
      
      createBooking: async () => {
        // First sync from cookies to ensure we have the latest data
        get().syncFromCookies();
        
        const { currentBooking } = get();
        
        // Validation
        if (!currentBooking.serviceId || !currentBooking.addressId || !currentBooking.date || !currentBooking.timeSlot) {
          console.error('Missing required booking information:', {
            serviceId: currentBooking.serviceId,
            addressId: currentBooking.addressId,
            date: currentBooking.date,
            timeSlot: currentBooking.timeSlot
          });
          set({ error: 'Missing required booking information' });
          return false;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const bookingData = {
            serviceTypeId: currentBooking.serviceId,
            addressId: currentBooking.addressId,
            date: currentBooking.date,
            timeSlot: currentBooking.timeSlot,
            squareFootage: currentBooking.squareFootage,
            hasPets: currentBooking.hasPets,
            messiness: currentBooking.messiness,
            supplies: currentBooking.supplies,
            frequency: currentBooking.frequency,
            notes: currentBooking.notes,
            preferredDates: currentBooking.preferredDates,
            preferredTimeSlots: currentBooking.preferredTimeSlots,
            flexibleScheduling: currentBooking.flexibleScheduling,
            cleanerId: currentBooking.cleanerId,
            bedCount: currentBooking.bedCount,
            bathCount: currentBooking.bathCount,
          };
          
          console.log('Submitting booking data:', bookingData);
          const response = await bookingAPI.createBooking(bookingData);
          console.log('Booking API response:', response);
          return response;  
        } catch (error: any) {
          console.error('Error creating booking:', error);
          set({ error: error.response?.data?.message || 'Failed to create booking' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      
      getUserBookings: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const bookings = await bookingAPI.getUserBookings();
          set({ bookings });
          return bookings;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch bookings' });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },
      rescheduleBooking: async (bookingId: string, date: string, timeSlot: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await bookingAPI.rescheduleBooking(bookingId, date, timeSlot);
          
          // Update the local state to reflect the reschedule
          const updatedBookings = get().bookings.map(booking => 
            booking._id === bookingId 
              ? { ...booking, date, timeSlot, status: 'pending' } 
              : booking
          );
          
          set({ bookings: updatedBookings });
          return true;
        } catch (error: any) {
          console.error('Error rescheduling booking:', error);
          set({ error: error.response?.data?.message || 'Failed to reschedule booking' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      
      resetCurrentBooking: () => set({
        currentBooking: {
          serviceId: null,
          serviceName: null,
          serviceDescription: null,
          basePrice: null,
          
          addressId: null,
          addressName: null,
          streetAddress: null,
          city: null,
          state: null,
          zipCode: null,
          squareFootage: null,
          
          date: null,
          timeSlot: null,
          preferredDates: [],
          preferredTimeSlots: [],
          
          cleanerId: null,
          
          hasPets: false,
          messiness: 5,
          supplies: 'cleaner',
          flexibleScheduling: false,
          frequency: 'one-time',
          notes: '',
          bedCount: undefined,
          bathCount: undefined,
          
          estimatedPrice: null,
        }
      }),
    }),
    {
      name: 'booking-storage',
      storage: cookieStorage,
      partialize: (state: BookingState) => ({ 
        currentBooking: state.currentBooking 
      }) as unknown as BookingState,
    }
  )
);

export default useBookingStore;