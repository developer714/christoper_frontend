// src/components/services/ServicesPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useServiceStore from '@/store/serviceStore';
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Home, 
  Sparkles, 
  Briefcase, 
  PartyPopper,
  ArrowRight,
  Clock,
  DollarSign,
  Calendar,
  X
} from 'lucide-react';
import Cookies from 'js-cookie';
import FancyLoader from '@/components/ui/FancyLoader';

export default function ServicesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { serviceTypes, fetchServiceTypes, isLoading: servicesLoading } = useServiceStore();
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [animateCard, setAnimateCard] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const loadServices = async () => {
      try {
        await fetchServiceTypes();
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadServices();
    }
  }, [isAuthenticated, isLoading, fetchServiceTypes, router]);

  // Toggle expanded service
  const toggleExpand = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
    
    // Trigger animation
    if (expandedService !== serviceId) {
      setAnimateCard(serviceId);
      setTimeout(() => setAnimateCard(null), 600);
    }
  };

  // Get service icon component
  const getServiceIcon = (service: any) => {
    if (service.code === 'deep' || service.name.includes('Deep')) 
      return <Sparkles size={24} strokeWidth={1.5} />;
    if (service.code === 'move' || service.name.includes('Move')) 
      return <Briefcase size={24} strokeWidth={1.5} />;
    if (service.code === 'party' || service.name.includes('Party')) 
      return <PartyPopper size={24} strokeWidth={1.5} />;
    if (service.code === 'office' || service.name.includes('Office'))
      return <Home size={24} strokeWidth={1.5} />;
    return <Home size={24} strokeWidth={1.5} />;
  };

  // Service details (features and not included)
  const serviceDetails = {
    standard: {
      features: [
        'Dusting all accessible surfaces',
        'Vacuuming or mopping all floors',
        'Cleaning kitchen counters and appliances',
        'Cleaning and sanitizing bathrooms',
        'Making beds (linens provided)',
        'Taking out trash'
      ],
      notIncluded: [
        'Inside appliances (oven, fridge)',
        'Window washing (exterior)',
        'Laundry and dishes',
        'Moving heavy furniture'
      ]
    },
    deep: {
      features: [
        'Everything in Standard Clean',
        'Inside oven and refrigerator',
        'Interior cabinet cleaning (1 included)',
        'Baseboards and door frames',
        'Window sills and blinds',
        'Detailed bathroom cleaning'
      ],
      notIncluded: [
        'Window washing (exterior)',
        'Wall washing',
        'Ceiling fans over 12 feet',
        'Stain removal'
      ]
    },
    move: {
      features: [
        'Deep cleaning of empty spaces',
        'Inside all cabinets and drawers',
        'Inside all appliances',
        'Baseboards, door frames, and light fixtures',
        'Window sills and tracks',
        'Detailed bathroom cleaning'
      ],
      notIncluded: [
        'Exterior windows',
        'Carpets (steam cleaning)',
        'Wall/ceiling marks requiring paint',
        'Heavy debris removal'
      ]
    },
    party: {
      features: [
        'Pre-event setup cleanup',
        'Post-party thorough cleaning',
        'Quick turnaround available',
        'Trash and recycling removal',
        'Kitchen and bathroom sanitizing',
        'Floor cleanup (spills, etc.)'
      ],
      notIncluded: [
        'Dish washing (large quantities)',
        'Furniture moving/rearranging',
        'Stain treatment (specialized)',
        'Outdoor cleaning'
      ]
    },
    office: {
      features: [
        'Desk and work surfaces cleaning',
        'Meeting rooms and common areas',
        'Kitchen and break rooms',
        'Restroom sanitization',
        'Trash removal',
        'Floor care (vacuum/mop)'
      ],
      notIncluded: [
        'Computer equipment cleaning',
        'Document organization',
        'Deep carpet cleaning',
        'Window washing'
      ]
    }
  };

  // Book service
  const handleBookService = (service: any) => {
    // Store the selected service in cookies
    Cookies.set('bookingService', JSON.stringify({
      serviceId: service._id,
      serviceName: service.name,
      serviceDescription: service.description || '',
      basePrice: service.basePrice || 120,
      serviceCode: service.code // Include code for backward compatibility
    }), { expires: 7 });

    // Navigate to address selection page
    router.push('/booking/address');
  };

  if (isLoading || loading || servicesLoading) {
    return <FancyLoader visible={true} message="Loading services..." />;
  }

  // Filter active services and sort them in a logical order
  const displayableServiceTypes = serviceTypes
    .filter(service => service.code && ['standard', 'deep', 'move', 'party', 'office'].includes(service.code))
    .sort((a, b) => {
      const order = { standard: 1, deep: 2, move: 3, party: 4, office: 5 };
      return (order[a.code as keyof typeof order] || 999) - (order[b.code as keyof typeof order] || 999);
    });

  return (
    <div className="min-h-screen bg-white pb-20 pt-6">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">Our Cleaning Services</h1>
          <p className="text-md md:text-lg text-gray-600 max-w-2xl mx-auto">
            Professional cleaning solutions tailored to your specific needs and preferences
          </p>
        </div>

        <div className="space-y-6">
          {displayableServiceTypes.map((service) => (
            <div 
              key={service._id}
              className={`bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm transition-all duration-300 transform ${
                animateCard === service._id ? 'scale-[1.01]' : ''
              } hover:shadow-md`}
            >
              {/* Service Header */}
              <div 
                className={`p-4 md:p-6 relative cursor-pointer`}
                onClick={() => toggleExpand(service._id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mr-4
                      ${service.code === 'standard' ? 'bg-blue-50 text-blue-500' : 
                        service.code === 'deep' ? 'bg-indigo-50 text-indigo-500' : 
                        service.code === 'move' ? 'bg-purple-50 text-purple-500' : 
                        service.code === 'party' ? 'bg-pink-50 text-pink-500' : 
                        'bg-green-50 text-green-500'}
                    `}>
                      {getServiceIcon(service)}
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">{service.name}</h2>
                      <p className="text-sm md:text-base text-gray-500 mt-1 max-w-2xl">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center flex-shrink-0 ml-4">
                    <div className="text-xl md:text-2xl font-bold text-gray-900 mr-4">${service.basePrice}</div>
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${service.code === 'standard' ? 'bg-blue-50 text-blue-500' : 
                        service.code === 'deep' ? 'bg-indigo-50 text-indigo-500' : 
                        service.code === 'move' ? 'bg-purple-50 text-purple-500' : 
                        service.code === 'party' ? 'bg-pink-50 text-pink-500' : 
                        'bg-green-50 text-green-500'}
                    `}>
                      {expandedService === service._id ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden border-t border-gray-100 
                  ${expandedService === service._id ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0 border-t-0'}`}
              >
                <div className="p-6">
                  {/* Service Highlights - Desktop: 4 columns, Mobile: 2 columns */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className={`
                      p-4 rounded-lg flex flex-col items-center text-center
                      ${service.code === 'standard' ? 'bg-blue-50 text-blue-800' : 
                        service.code === 'deep' ? 'bg-indigo-50 text-indigo-800' : 
                        service.code === 'move' ? 'bg-purple-50 text-purple-800' : 
                        service.code === 'party' ? 'bg-pink-50 text-pink-800' : 
                        'bg-green-50 text-green-800'}
                    `}>
                      <Clock className="mb-2" size={20} />
                      <span className="text-xs uppercase font-medium tracking-wide">Duration</span>
                      <span className="font-semibold">2 hours</span>
                    </div>
                    <div className={`
                      p-4 rounded-lg flex flex-col items-center text-center
                      ${service.code === 'standard' ? 'bg-blue-50 text-blue-800' : 
                        service.code === 'deep' ? 'bg-indigo-50 text-indigo-800' : 
                        service.code === 'move' ? 'bg-purple-50 text-purple-800' : 
                        service.code === 'party' ? 'bg-pink-50 text-pink-800' : 
                        'bg-green-50 text-green-800'}
                    `}>
                      <DollarSign className="mb-2" size={20} />
                      <span className="text-xs uppercase font-medium tracking-wide">Starting at</span>
                      <span className="font-semibold">${service.basePrice}/clean</span>
                    </div>
                    <div className={`
                      p-4 rounded-lg flex flex-col items-center text-center
                      ${service.code === 'standard' ? 'bg-blue-50 text-blue-800' : 
                        service.code === 'deep' ? 'bg-indigo-50 text-indigo-800' : 
                        service.code === 'move' ? 'bg-purple-50 text-purple-800' : 
                        service.code === 'party' ? 'bg-pink-50 text-pink-800' : 
                        'bg-green-50 text-green-800'}
                    `}>
                      <Calendar className="mb-2" size={20} />
                      <span className="text-xs uppercase font-medium tracking-wide">Weekly Discount</span>
                      <span className="font-semibold">15% off</span>
                    </div>
                    <div className={`
                      p-4 rounded-lg flex flex-col items-center text-center
                      ${service.code === 'standard' ? 'bg-blue-50 text-blue-800' : 
                        service.code === 'deep' ? 'bg-indigo-50 text-indigo-800' : 
                        service.code === 'move' ? 'bg-purple-50 text-purple-800' : 
                        service.code === 'party' ? 'bg-pink-50 text-pink-800' : 
                        'bg-green-50 text-green-800'}
                    `}>
                      <Calendar className="mb-2" size={20} />
                      <span className="text-xs uppercase font-medium tracking-wide">Bi-Weekly</span>
                      <span className="font-semibold">10% off</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* What's Included */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Check size={18} className={`
                          ${service.code === 'standard' ? 'text-blue-500' : 
                            service.code === 'deep' ? 'text-indigo-500' : 
                            service.code === 'move' ? 'text-purple-500' : 
                            service.code === 'party' ? 'text-pink-500' : 
                            'text-green-500'} mr-2
                        `} />
                        What's Included
                      </h3>
                      <ul className="space-y-3 grid md:grid-cols-1 lg:grid-cols-2 gap-3">
                        {serviceDetails[service.code as keyof typeof serviceDetails]?.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <div className={`
                              w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 mr-2
                              ${service.code === 'standard' ? 'bg-blue-100 text-blue-600' : 
                                service.code === 'deep' ? 'bg-indigo-100 text-indigo-600' : 
                                service.code === 'move' ? 'bg-purple-100 text-purple-600' : 
                                service.code === 'party' ? 'bg-pink-100 text-pink-600' : 
                                'bg-green-100 text-green-600'}
                            `}>
                              <Check size={12} />
                            </div>
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* What's Not Included */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <X size={18} className="text-gray-400 mr-2" />
                        Not Included
                      </h3>
                      <ul className="space-y-3 grid md:grid-cols-1 lg:grid-cols-2 gap-3">
                        {serviceDetails[service.code as keyof typeof serviceDetails]?.notIncluded.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-5 h-5 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center mt-0.5 mr-2">
                              <X size={12} className="text-gray-500" />
                            </div>
                            <span className="text-gray-500">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => handleBookService(service)}
                      className={`
                        px-8 py-3 rounded-lg font-medium transition-all cursor-pointer
                        flex items-center justify-center group
                        ${service.code === 'standard' ? 'bg-[#c3cb71] hover:bg-[#c3cb71]/50 text-white' : 
                          service.code === 'deep' ? 'bg-[#1b85b8] hover:bg-[#1b85b8]/50 text-white' : 
                          service.code === 'move' ? 'bg-[#ae5a41] hover:bg-[#ae5a41]/50 text-white' : 
                          service.code === 'party' ? 'bg-[#559e83] hover:bg-[#559e83]/50 text-white' : 
                          'bg-[#5a5255] hover:bg-[#5a5255]/50 text-white'}
                      `}
                    >
                      Book This Service
                      <ArrowRight size={18} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}