import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Eye, MapPin, Navigation2, Check, Home, Camera, Calendar,
  Clock, Sun, Moon, Info, ArrowLeft, Star, Share2, Volume2, VolumeX,
  Heart, Bookmark, Compass, Maximize2, Minimize2, Map
} from 'lucide-react';
import CrowdPrediction from './CrowdPrediction';
import SmartPacking from './SmartPacking';
import useMediaQuery from '../hooks/useMediaQuery';
import { debounce } from '../utils/debounce';
import SkeletonLoader from './common/SkeletonLoader';
import { useData } from '../context/DataContext';

// Types
type WeatherInfo = {
  season: string;
  temperature: string;
  conditions: string;
};

interface Location {
  id: string;
  name: string;
  embedUrl: string;
  description: string;
  image: string;
  region?: string;
  country?: string;
  bestTimeToVisit?: string;
  historicalFacts?: string[];
  culturalNotes?: string[];
  weatherInfo?: WeatherInfo;
  localTime?: string;
  popularity?: number;
  virtualTourUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface VirtualTourProps {
  onClose?: () => void;
  initialLocationId?: string;
}

// Constants
const DEFAULT_LOCATIONS: Location[] = [
  {
    id: "eiffel-tower",
    name: "Eiffel Tower, France",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.2922926520006728!3d48.85837009999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sEiffel%20Tower!5e0!3m2!1sen!2sus!4v1709751154651!5m2!1sen!2sus",
    description: "The iconic symbol of Paris, standing 324 meters tall",
    image: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800&q=80",
    region: "Île-de-France",
    country: "France",
    bestTimeToVisit: "June to September",
    historicalFacts: [
      "Completed in 1889 for the World's Fair",
      "Initially meant to be temporary",
      "Named after engineer Gustave Eiffel"
    ],
    coordinates: {
      lat: 48.858370,
      lng: 2.294481
    }
  },
  // ... other default locations
];

const VirtualTour: React.FC<VirtualTourProps> = ({ onClose, initialLocationId }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [addedLocations, setAddedLocations] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const { destinations: bucketList, addDestination } = useData();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showCrowdPrediction, setShowCrowdPrediction] = useState(false);
  const [showSmartPacking, setShowSmartPacking] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'streetview'>('map');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Memoized values
  const bucketListLocations = useMemo(() =>
    locations.filter(loc => !DEFAULT_LOCATIONS.some(d => d.id === loc.id)),
    [locations]
  );

  const isLocationAdded = useMemo(() =>
    selectedLocation ? addedLocations.includes(selectedLocation.id) : false,
    [addedLocations, selectedLocation]
  );

  // Derived values
  const iframeSrc = useMemo(() => {
    if (!selectedLocation) return '';
    if (viewMode === 'streetview' && selectedLocation.coordinates) {
      return `https://www.google.com/maps/embed/v1/streetview?key=AIzaSyAcuTuDw5roRE0PJvI59M_4x5u4nuRXytw&location=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}&heading=210&pitch=10`;
    }
    return selectedLocation.embedUrl;
  }, [selectedLocation, viewMode]);

  // Effects
  useEffect(() => {
    const initializeLocations = () => {
      const allLocations = [
        ...DEFAULT_LOCATIONS,
        ...bucketList.map((dest: any) => ({
          ...dest,
          id: dest._id || dest.name,
          embedUrl: dest.embedUrl || `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${encodeURIComponent(dest.name)}!5e0!3m2!1sen!2sus!4v1709751296244!5m2!1sen!2sus&q=${encodeURIComponent(dest.name)}`,
        }))
      ];

      setLocations(allLocations);

      // Set initial location
      const initialLocation = initialLocationId
        ? allLocations.find(loc => loc.id === initialLocationId) || allLocations[0]
        : allLocations[0];
      setSelectedLocation(initialLocation);
    };

    initializeLocations();

    // Time updater
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [initialLocationId]);

  // Handlers
  const handleLocationChange = useCallback((locationId: string) => {
    setIsLoading(true);
    setIframeError(false);
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocation(location);
    }
    setTimeout(() => setIsLoading(false), 500);
  }, [locations]);

  const debouncedLocationChange = useMemo(
    () => debounce(handleLocationChange, 200),
    [handleLocationChange]
  );

  const addToBucketList = useCallback(async () => {
    if (!selectedLocation) return;

    if (addedLocations.includes(selectedLocation.id)) return;

    await addDestination({
      name: selectedLocation.name,
      coordinates: selectedLocation.coordinates || { lat: 0, lng: 0 }
    });

    setAddedLocations(prev => [...prev, selectedLocation.id]);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }, [selectedLocation, addedLocations]);

  const handleShare = useCallback(async () => {
    if (!selectedLocation) return;

    const shareData = {
      title: selectedLocation.name,
      text: `Check out ${selectedLocation.name} in ${selectedLocation.country || ''}! ${selectedLocation.description}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  }, [selectedLocation]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'map' ? 'streetview' : 'map');
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Render helpers
  const renderLocationOptions = () => (
    <>
      <optgroup label="Famous Landmarks">
        {DEFAULT_LOCATIONS.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </optgroup>
      {bucketListLocations.length > 0 && (
        <optgroup label="Your Bucket List">
          {bucketListLocations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} {loc.country ? `(${loc.country})` : ''}
            </option>
          ))}
        </optgroup>
      )}
    </>
  );

  const renderHistoricalFacts = () => (
    selectedLocation?.historicalFacts && (
      <div className={`p-4 rounded-lg ${isNightMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h4 className={`font-medium mb-2 ${isNightMode ? 'text-white' : 'text-gray-900'}`}>
          Historical Facts
        </h4>
        <ul className="space-y-1">
          {selectedLocation.historicalFacts.map((fact, index) => (
            <li key={index} className={`flex items-center gap-2 text-sm ${isNightMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isNightMode ? 'bg-blue-400' : 'bg-blue-600'
                }`} />
              {fact}
            </li>
          ))}
        </ul>
      </div>
    )
  );

  const renderMapView = () => (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'aspect-[16/9]'} rounded-lg overflow-hidden border`}>
      {isLoading ? (
        <SkeletonLoader className="absolute inset-0" />
      ) : iframeError ? (
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${isNightMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
          }`}>
          <MapPin className="w-12 h-12 mb-2" />
          <p>Failed to load map</p>
          <button
            onClick={() => setIframeError(false)}
            className={`mt-2 px-4 py-2 rounded-lg ${isNightMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <iframe
            src={iframeSrc}
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen={isFullscreen}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onError={() => setIframeError(true)}
            title={`${selectedLocation?.name} ${viewMode === 'streetview' ? 'Street View' : 'Map View'}`}
          />
          {isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className={`absolute top-4 right-4 p-2 rounded-full ${isNightMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                } shadow-lg`}
              aria-label="Exit fullscreen"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          )}
        </>
      )}
    </div>
  );

  const renderMobileView = () => (
    <div className="flex flex-col h-full">
      {/* Map View (Top) */}
      <div className="flex-1 relative">
        {renderMapView()}

        {/* Mobile Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={toggleViewMode}
            className={`p-3 rounded-full shadow-lg ${isNightMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
              }`}
            aria-label={`Switch to ${viewMode === 'map' ? 'street view' : 'map view'}`}
          >
            {viewMode === 'map' ? (
              <Compass className="w-5 h-5" />
            ) : (
              <Map className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={toggleFullscreen}
            className={`p-3 rounded-full shadow-lg ${isNightMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
              }`}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Details Panel (Bottom Sheet) */}
      <div className={`p-4 ${isNightMode ? 'bg-gray-800' : 'bg-white'} rounded-t-2xl shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${isNightMode ? 'text-white' : 'text-gray-800'}`}>
            {selectedLocation?.name}
          </h2>
          <button
            onClick={toggleViewMode}
            className="p-2"
            aria-label={`Switch to ${viewMode === 'map' ? 'street view' : 'map view'}`}
          >
            {viewMode === 'map' ? (
              <Compass className="w-5 h-5" />
            ) : (
              <Map className="w-5 h-5" />
            )}
          </button>
        </div>

        <p className={`text-sm ${isNightMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
          {selectedLocation?.description}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setShowCrowdPrediction(true)}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 ${isNightMode
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-50 hover:bg-blue-100'
              }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-xs">Crowds</span>
          </button>
          <button
            onClick={() => setShowSmartPacking(true)}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 ${isNightMode
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-green-50 hover:bg-green-100'
              }`}
          >
            <Camera className="w-4 h-4" />
            <span className="text-xs">Packing</span>
          </button>
          <button
            onClick={addToBucketList}
            disabled={isLocationAdded}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 ${isLocationAdded
              ? 'bg-green-600 text-white'
              : isNightMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-50 hover:bg-purple-100'
              }`}
          >
            {isLocationAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            <span className="text-xs">{isLocationAdded ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* Location Selector */}
        <select
          onChange={(e) => debouncedLocationChange(e.target.value)}
          value={selectedLocation?.id || ''}
          className={`w-full p-2 rounded-lg ${isNightMode
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-white border-gray-300 text-gray-900'
            } shadow-sm mb-4`}
        >
          {renderLocationOptions()}
        </select>
      </div>
    </div>
  );

  const renderDesktopView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 overflow-auto">
      {/* Left Panel */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isNightMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Select Location
          </label>
          <select
            onChange={(e) => debouncedLocationChange(e.target.value)}
            value={selectedLocation?.id || ''}
            className={`w-full p-2 rounded-lg ${isNightMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
              } shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            aria-label="Select a location to tour"
          >
            {renderLocationOptions()}
          </select>
        </div>

        {/* Location Details */}
        {selectedLocation && (
          <div className={`p-4 rounded-lg ${isNightMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-medium ${isNightMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <Navigation2 className={`w-4 h-4 ${isNightMode ? 'text-blue-400' : 'text-blue-600'}`} />
                Location Details
              </h3>
            </div>
            <p className={`mt-2 text-sm ${isNightMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {selectedLocation.description}
            </p>

            <div className="mt-3 space-y-1">
              {selectedLocation.region && (
                <div className={`text-sm ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <strong>Region:</strong> {selectedLocation.region}
                </div>
              )}
              {selectedLocation.country && (
                <div className={`text-sm ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <strong>Country:</strong> {selectedLocation.country}
                </div>
              )}
              {selectedLocation.bestTimeToVisit && (
                <div className={`text-sm ${isNightMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                  <Calendar className="w-4 h-4" />
                  <strong>Best time:</strong> {selectedLocation.bestTimeToVisit}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowCrowdPrediction(true)}
            className={`p-3 rounded-lg flex items-center justify-center gap-2 ${isNightMode
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-50 hover:bg-blue-100'
              }`}
            aria-label="View crowd predictions"
          >
            <Clock className="w-4 h-4" />
            <span>Crowd Prediction</span>
          </button>
          <button
            onClick={() => setShowSmartPacking(true)}
            className={`p-3 rounded-lg flex items-center justify-center gap-2 ${isNightMode
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-green-50 hover:bg-green-100'
              }`}
            aria-label="View smart packing suggestions"
          >
            <Camera className="w-4 h-4" />
            <span>Smart Packing</span>
          </button>
        </div>

        {/* View Mode Toggle */}
        <button
          onClick={toggleViewMode}
          className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 ${isNightMode
            ? 'bg-purple-600 hover:bg-purple-700'
            : 'bg-purple-50 hover:bg-purple-100'
            }`}
          aria-label={`Switch to ${viewMode === 'map' ? 'street view' : 'map view'}`}
        >
          <MapPin className="w-4 h-4" />
          <span>Switch to {viewMode === 'map' ? 'Street View' : 'Map View'}</span>
        </button>

        {/* Add to Bucket List */}
        <div className="flex gap-2">
          <button
            onClick={addToBucketList}
            disabled={isLocationAdded}
            className={`flex-1 py-3 rounded-lg transition flex items-center justify-center gap-2 ${isLocationAdded
              ? 'bg-green-600 text-white cursor-not-allowed'
              : isNightMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            aria-label={isLocationAdded ? 'Location already added' : 'Add to bucket list'}
          >
            {isLocationAdded ? (
              <>
                <Check className="w-5 h-5" />
                Added
              </>
            ) : (
              <>
                <Star className="w-5 h-5" />
                Add to Bucket List
              </>
            )}
          </button>
          <button
            onClick={handleShare}
            className={`px-4 py-3 rounded-lg transition ${isNightMode
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
              }`}
            aria-label="Share this location"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {showSuccess && (
          <div className={`text-center text-sm ${isNightMode ? 'text-green-400' : 'text-green-600'
            } animate-fade-in`}>
            Successfully added to your bucket list!
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="md:col-span-2 space-y-4">
        {renderMapView()}
        {renderHistoricalFacts()}
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 ${isNightMode ? 'bg-gray-900/95' : 'bg-black/50'} flex items-center justify-center p-4 z-50`}>
      <div className={`${isNightMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl ${isFullscreen ? '!fixed !inset-0 !max-w-none !rounded-none' : ''}`}>
        {/* Header */}
        <div className={`p-4 md:p-6 border-b ${isNightMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isMobile && (
                <button
                  onClick={() => navigate('/')}
                  className={`p-2 rounded-lg transition-colors ${isNightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  aria-label="Back to Home"
                >
                  <ArrowLeft className={`w-5 h-5 ${isNightMode ? 'text-gray-300' : 'text-gray-500'}`} />
                </button>
              )}
              <div className="flex items-center gap-2">
                <Eye className={`w-6 h-6 ${isNightMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-xl md:text-2xl font-bold ${isNightMode ? 'text-white' : 'text-gray-800'}`}>
                  Virtual Tour
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isMobile && (
                <span className={`text-sm ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentTime}
                </span>
              )}
              {!isMobile && (
                <>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-lg ${isNightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
                  >
                    {soundEnabled ? (
                      <Volume2 className={`w-5 h-5 ${isNightMode ? 'text-gray-300' : 'text-gray-500'}`} />
                    ) : (
                      <VolumeX className={`w-5 h-5 ${isNightMode ? 'text-gray-300' : 'text-gray-500'}`} />
                    )}
                  </button>
                  <button
                    onClick={() => setIsNightMode(!isNightMode)}
                    className={`p-2 rounded-lg ${isNightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    aria-label={isNightMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {isNightMode ? (
                      <Sun className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <Moon className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${isNightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                aria-label="Close virtual tour"
              >
                <X className={`w-5 h-5 ${isNightMode ? 'text-gray-300' : 'text-gray-500'}`} />
              </button>
            </div>
          </div>
          {isMobile && (
            <p className={`mt-1 text-sm ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {selectedLocation?.name} • {currentTime}
            </p>
          )}
        </div>

        {/* Main Content */}
        {isMobile ? renderMobileView() : renderDesktopView()}
      </div>

      {/* Modals */}
      {showCrowdPrediction && selectedLocation && (
        <CrowdPrediction
          destination={selectedLocation.name}
          onClose={() => setShowCrowdPrediction(false)}
        />
      )}

      {showSmartPacking && selectedLocation && (
        <SmartPacking
          destination={{
            name: selectedLocation.name,
            region: selectedLocation.region || '',
            country: selectedLocation.country || '',
            id: selectedLocation.id as any
          }}
          onClose={() => setShowSmartPacking(false)}
        />
      )}
    </div>
  );
};

export default VirtualTour;