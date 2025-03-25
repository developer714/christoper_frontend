"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Info, HelpCircle, BookOpen, Lightbulb, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface InfoCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  route: string;
  backgroundImage?: string;
}

interface ServiceCardCarouselProps {
  title?: string;
  showControls?: boolean;
}

const ServiceCardCarousel: React.FC<ServiceCardCarouselProps> = ({ 
  title = "Explore", 
  showControls = true 
}) => {
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const autoScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const infoCards: InfoCard[] = [
    {
      id: 'about',
      title: 'About Us',
      description: 'Learn more about our company, mission and values.',
      icon: <Info size={32} />,
      gradient: 'from-blue-400 to-blue-600',
      route: '/about',
      backgroundImage: '/AboutUs-HCleanerzImage.png'
    },
    {
      id: 'faq',
      title: 'FAQ',
      description: 'Find answers to commonly asked questions about our services.',
      icon: <HelpCircle size={32} />,
      gradient: 'from-purple-400 to-purple-600',
      route: '/faq'
    },
    {
      id: 'blog',
      title: 'Blog',
      description: 'Read our latest articles on cleaning tips and home maintenance.',
      icon: <BookOpen size={32} />,
      gradient: 'from-green-400 to-green-600',
      route: '/blog'
    },
    {
      id: 'tips',
      title: 'Cleaning Tips',
      description: 'Expert advice to keep your home clean and organized.',
      icon: <Lightbulb size={32} />,
      gradient: 'from-amber-400 to-amber-600',
      route: '/tips'
    },
    {
      id: 'services',
      title: 'Our Services',
      description: 'Explore the full range of cleaning services we offer.',
      icon: <Sparkles size={32} />,
      gradient: 'from-rose-400 to-rose-600',
      route: '/services'
    }
  ];

  // Auto-scrolling functionality
  useEffect(() => {
    if (!autoScrollEnabled || !carouselRef.current) return;

    const scrollRight = () => {
      // Always check .current
      if (!carouselRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const newScrollLeft = scrollLeft + 300;

      // If we're at the end, scroll back to the beginning
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Otherwise, continue scrolling right
        carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
      }
    };

    // Set up the auto-scroll timer
    autoScrollTimerRef.current = setInterval(scrollRight, 3000);

    return () => {
      // Clear the interval on unmount
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [autoScrollEnabled]);

  // Handle manual scrolling - pause auto-scroll when user interacts
  const handleManualScroll = () => {
    setAutoScrollEnabled(false);

    // Clear the old timer if it exists
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
    }

    // Resume auto-scroll after 8 seconds of inactivity
    autoScrollTimerRef.current = setTimeout(() => {
      setAutoScrollEnabled(true);
    }, 8000);
  };

  // Scroll control functions
  const scrollLeft = () => {
    if (!carouselRef.current) return;
    const newScrollLeft = carouselRef.current.scrollLeft - 300;
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    handleManualScroll();
  };

  const scrollRight = () => {
    if (!carouselRef.current) return;
    const newScrollLeft = carouselRef.current.scrollLeft + 300;
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    handleManualScroll();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {showControls && (
          <div className="flex space-x-2">
            <button
              onClick={scrollLeft}
              className="bg-gray-100 hover:bg-gray-200 p-1.5 rounded-[48px] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={scrollRight}
              className="bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <div
          ref={carouselRef}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory py-2 -mx-1 px-1 space-x-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={handleManualScroll}
        >
          {infoCards.map((card) => (
            <div
              key={card.id}
              className="snap-center flex-shrink-0 w-64 transition-transform transform hover:scale-105"
            >
              {/* Image/Gradient Card */}
              <div 
                className={`h-32 w-full rounded-t-[16px] overflow-hidden shadow-md ${
                  card.backgroundImage 
                    ? 'bg-cover bg-center' 
                    : `bg-gradient-to-br ${card.gradient}`
                }`}
                style={card.backgroundImage ? { backgroundImage: `url(${card.backgroundImage})` } : {}}
              > 
                <div className="p-3">
                  <div className="bg-white/20 rounded-full p-2 w-fit">
                    {card.icon}
                  </div>
                </div>
              </div>
              
              {/* Text Content Below Card */}
              <div className="bg-white border border-gray-100 shadow-sm p-3 rounded-b-[16px]">
                <h3 className="text-base font-bold text-gray-800 mb-1">{card.title}</h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{card.description}</p>
                <Link href={card.route} passHref>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5 px-3 rounded-lg transition-all w-full">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceCardCarousel;