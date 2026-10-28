import React, { useRef, useState, useEffect } from 'react';
import Globe from 'react-globe.gl';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  RotateCw,
  Globe as GlobeIcon,
  MapPin,
  Sun,
  Moon,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Star,
  Compass,
  X,
  Volume2,
  VolumeX,
  Map,
  Menu,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import useSound from 'use-sound';

// Sound effects
import spinSound from '../sounds/spin.mp3';
import zoomSound from '../sounds/zoom.mp3';
import selectSound from '../sounds/select.mp3';
import clickSound from '../sounds/click.mp3';

interface Destination {
  name: string;
  lat: number;
  lng: number;
  color: string;
  description: string;
  bestTime: string;
  link: string;
}
const destinations: Destination[] = [
  {
    name: 'Santorini, Greece',
    lat: 36.3932,
    lng: 25.4615,
    color: '#FF6B6B',
    description: 'White-washed buildings with blue domes overlooking the Aegean Sea',
    bestTime: 'May to October',
    link: 'https://en.wikipedia.org/wiki/Santorini'
  },
  {
    name: 'Kyoto, Japan',
    lat: 35.0116,
    lng: 135.7681,
    color: '#6B8E23',
    description: 'Historic temples, traditional tea houses, and cherry blossoms',
    bestTime: 'March to May, October to November',
    link: 'https://en.wikipedia.org/wiki/Kyoto'
  },
  {
    name: 'Banff National Park, Canada',
    lat: 51.4968,
    lng: -115.9281,
    color: '#1E90FF',
    description: 'Stunning mountain scenery, turquoise lakes, and outdoor adventures',
    bestTime: 'June to August, December to March',
    link: 'https://en.wikipedia.org/wiki/Banff_National_Park'
  },
  {
    name: 'Petra, Jordan',
    lat: 30.3285,
    lng: 35.4444,
    color: '#D2691E',
    description: 'Ancient rock-cut architecture and archaeological wonder',
    bestTime: 'March to May, September to November',
    link: 'https://en.wikipedia.org/wiki/Petra'
  },
  {
    name: 'Cape Town, South Africa',
    lat: -33.9249,
    lng: 18.4241,
    color: '#FF8C00',
    description: 'Table Mountain, beaches, and vibrant city life',
    bestTime: 'November to March',
    link: 'https://en.wikipedia.org/wiki/Cape_Town'
  }
];

const MOBILE_BREAKPOINT = 768;

const GlobeSpinner: React.FC = () => {
  const navigate = useNavigate();
  const globeRef = useRef<any>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [arcs, setArcs] = useState<any[]>([]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [globeReady, setGlobeReady] = useState(false);
  const { destinations: favorites, addDestination, deleteDestination } = useData();
  const [showFavorites, setShowFavorites] = useState(false);
  const [altitude, setAltitude] = useState(2);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Check for mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sound effects
  const [playSpin] = useSound(spinSound, {
    volume: 0.5,
    soundEnabled,
    onError: () => console.warn('Failed to load spin sound')
  });
  const [playZoom] = useSound(zoomSound, {
    volume: 0.3,
    soundEnabled,
    onError: () => console.warn('Failed to load zoom sound')
  });
  const [playSelect] = useSound(selectSound, {
    volume: 0.4,
    soundEnabled,
    onError: () => console.warn('Failed to load select sound')
  });
  const [playClick] = useSound(clickSound, {
    volume: 0.2,
    soundEnabled,
    onError: () => console.warn('Failed to load click sound')
  });

  // Start without modifying to localStorage since DataContext handles it

  // Initialize globe
  useEffect(() => {
    if (!globeReady || !globeRef.current) return;

    const globe = globeRef.current;
    globe.controls().autoRotate = autoRotate;
    globe.controls().autoRotateSpeed = 0.5;

    // Different initial altitude for mobile
    const initialAltitude = isMobile ? 1.5 : 2;
    setAltitude(initialAltitude);
    globe.pointOfView({ lat: 20, lng: 0, altitude: initialAltitude }, 1000);

    return () => {
      if (globeRef.current) {
        globeRef.current.controls().autoRotate = false;
      }
    };
  }, [globeReady, autoRotate, isMobile]);

  const handleSpin = () => {
    if (!globeRef.current) return;

    playSpin();
    setIsSpinning(true);
    setSelectedDestination(null);
    setShowDetails(false);
    setArcs([]);

    const pov = globeRef.current.pointOfView() as any;
    setArcs([{
      startLat: pov?.lat || 0,
      startLng: pov?.lng || 0,
      endLat: Math.random() * 180 - 90,
      endLng: Math.random() * 360 - 180,
      color: ['#FF6B6B', '#4ECDC4', '#FFE66D'][Math.floor(Math.random() * 3)]
    }]);

    let spinCount = 0;
    const spinInterval = setInterval(() => {
      if (!globeRef.current) {
        clearInterval(spinInterval);
        return;
      }

      globeRef.current.pointOfView({
        lat: Math.random() * 180 - 90,
        lng: Math.random() * 360 - 180,
        altitude: 1.5 + Math.random() * 1.5
      }, 500);

      spinCount++;
      if (spinCount > 6) {
        clearInterval(spinInterval);
        selectRandomDestination();
      }
    }, 600);

    return () => clearInterval(spinInterval);
  };

  const selectRandomDestination = () => {
    playSelect();
    const randomIndex = Math.floor(Math.random() * destinations.length);
    const destination = destinations[randomIndex];

    handleDestinationSelect(destination);
    setIsSpinning(false);
  };

  const updateMarkers = (destination: Destination) => {
    setMarkers([
      ...favorites.map((fav: any) => ({
        lat: fav.coordinates?.lat || 0,
        lng: fav.coordinates?.lng || 0,
        size: 0.25,
        color: '#FFD700',
        label: `${fav.name} (Favorite)`
      })),
      {
        lat: destination.lat,
        lng: destination.lng,
        size: 0.3,
        color: destination.color,
        label: destination.name
      }
    ]);
  };

  const handleDestinationSelect = (destination: Destination) => {
    setSelectedDestination(destination);
    updateMarkers(destination);
    flyToDestination(destination);

    // On mobile, always show details when selecting
    if (isMobile) {
      setShowDetails(true);
    }
  };

  const flyToDestination = (destination: Destination) => {
    if (!globeRef.current) return;

    const currentPov = globeRef.current.pointOfView() as any;
    if (currentPov) {
      setArcs([{
        startLat: currentPov.lat || 0,
        startLng: currentPov.lng || 0,
        endLat: destination.lat,
        endLng: destination.lng,
        color: [destination.color, '#FFFFFF'],
        dashLength: 0.2,
        dashAnimateTime: 2000
      }]);
    }

    // Different zoom levels for mobile
    const targetAltitude = isMobile ? 1.0 : 1.2;
    globeRef.current.pointOfView({
      lat: destination.lat,
      lng: destination.lng,
      altitude: targetAltitude
    }, 2000);
  };

  const handleZoom = (delta: number) => {
    playClick();
    const newAltitude = Math.max(0.5, Math.min(5, altitude + delta));
    setAltitude(newAltitude);
    if (globeRef.current) {
      const pov = globeRef.current.pointOfView() as any;
      if (pov) {
        globeRef.current.pointOfView({ ...pov, altitude: newAltitude }, 500);
      }
    }
  };

  const resetView = () => {
    playClick();
    const initialAltitude = isMobile ? 1.5 : 2;
    setAltitude(initialAltitude);
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: initialAltitude }, 1000);
    }
  };

  const toggleFavorite = async (destination: Destination) => {
    playClick();
    const existingFavorite = favorites.find(fav =>
      fav.coordinates.lat === destination.lat && fav.coordinates.lng === destination.lng
    );

    if (existingFavorite && existingFavorite._id) {
      await deleteDestination(existingFavorite._id);
    } else {
      await addDestination({
        name: destination.name,
        coordinates: { lat: destination.lat, lng: destination.lng }
      });
    }

    updateMarkers(selectedDestination || destination);
  };

  const exploreDestination = () => {
    playClick();
    if (selectedDestination?.link) {
      window.open(selectedDestination.link, '_blank');
    }
  };

  const handleBackToHome = () => {
    playClick();
    navigate('/');
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Mobile Controls
  const renderMobileControls = () => (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-20">
      <div className="bg-gray-800 bg-opacity-80 rounded-full px-4 py-2 flex items-center gap-4">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 text-white"
          aria-label="Menu"
        >
          <Menu size={20} />
        </button>

        <button
          onClick={handleSpin}
          disabled={isSpinning || !globeReady}
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${isSpinning
            ? 'bg-gray-600 text-gray-300'
            : 'bg-gradient-to-r from-pink-500 to-orange-500 text-white'
            }`}
        >
          <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          <span className="text-sm">{isSpinning ? 'Spinning...' : 'Spin'}</span>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-30 flex flex-col justify-end">
          <div className="bg-gray-800 rounded-t-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-bold">Controls</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="text-gray-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => handleZoom(-0.5)}
                className="p-3 bg-gray-700 rounded-lg text-white flex flex-col items-center"
              >
                <ZoomIn size={20} />
                <span className="text-xs mt-1">Zoom In</span>
              </button>
              <button
                onClick={() => handleZoom(0.5)}
                className="p-3 bg-gray-700 rounded-lg text-white flex flex-col items-center"
              >
                <ZoomOut size={20} />
                <span className="text-xs mt-1">Zoom Out</span>
              </button>
              <button
                onClick={resetView}
                className="p-3 bg-gray-700 rounded-lg text-white flex flex-col items-center"
              >
                <Compass size={20} />
                <span className="text-xs mt-1">Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => setIsNightMode(!isNightMode)}
                className="p-3 bg-gray-700 rounded-lg text-white flex flex-col items-center"
              >
                {isNightMode ? <Sun size={20} /> : <Moon size={20} />}
                <span className="text-xs mt-1">{isNightMode ? 'Day' : 'Night'}</span>
              </button>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className="p-3 bg-gray-700 rounded-lg text-white flex flex-col items-center"
              >
                <GlobeIcon size={20} className={autoRotate ? 'text-green-400' : 'text-gray-400'} />
                <span className="text-xs mt-1">Rotate</span>
              </button>
              <button
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  setShowMobileMenu(false);
                }}
                className="p-3 bg-gray-700 rounded-lg text-white flex flex-col items-center"
              >
                <Star size={20} className={favorites.length > 0 ? 'text-yellow-400' : 'text-gray-400'} />
                <span className="text-xs mt-1">Favorites</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={toggleSound}
                className="p-3 bg-gray-700 rounded-lg text-white flex flex-col items-center"
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                <span className="text-xs mt-1">Sound {soundEnabled ? 'On' : 'Off'}</span>
              </button>
              <button
                onClick={handleBackToHome}
                className="p-3 bg-gray-700 rounded-lg text-white flex flex-col items-center"
              >
                <ArrowLeft size={20} />
                <span className="text-xs mt-1">Go Home</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Mobile Destination Card
  const renderMobileDestinationCard = () => (
    selectedDestination && (
      <div className={`fixed ${showDetails ? 'top-4' : 'top-auto bottom-24'} left-4 right-4 z-10 bg-white bg-opacity-90 rounded-xl shadow-2xl overflow-hidden transition-all`}>
        <div
          className="p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
          onClick={() => setShowDetails(!showDetails)}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: selectedDestination.color }}
            >
              <MapPin className="text-white" size={14} />
            </div>
            <h3 className="text-sm font-bold text-gray-800 truncate">
              {selectedDestination.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(selectedDestination);
              }}
              className="p-1 text-gray-400 hover:text-yellow-500"
            >
              <Star
                size={16}
                fill="currentColor"
                className={favorites.some((fav: any) =>
                  fav.coordinates.lat === selectedDestination.lat &&
                  fav.coordinates.lng === selectedDestination.lng
                ) ? 'text-yellow-500' : 'text-gray-300'}
              />
            </button>
            {showDetails ? (
              <ChevronDown size={16} className="text-gray-500" />
            ) : (
              <ChevronUp size={16} className="text-gray-500" />
            )}
          </div>
        </div>

        {showDetails && (
          <div className="px-3 pb-3">
            <p className="text-gray-600 text-sm mb-2">{selectedDestination.description}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <Map size={12} />
              <span>Best time: {selectedDestination.bestTime}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  playClick();
                  flyToDestination(selectedDestination);
                }}
                className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm"
              >
                Fly To
              </button>
              <button
                onClick={exploreDestination}
                className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm"
              >
                Explore
              </button>
            </div>
          </div>
        )}
      </div>
    )
  );

  // Desktop Destination Card
  const renderDesktopDestinationCard = () => (
    selectedDestination && (
      <div className={`absolute top-1/2 left-4 transform -translate-y-1/2 transition-all ${showDetails ? 'w-80' : 'w-60'
        } bg-white bg-opacity-90 rounded-xl shadow-2xl overflow-hidden z-10`}>
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
          onClick={() => {
            playClick();
            setShowDetails(!showDetails);
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: selectedDestination.color }}
            >
              <MapPin className="text-white" size={18} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {selectedDestination.name}
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedDestination);
            }}
            className="p-1 text-gray-400 hover:text-yellow-500"
          >
            <Star
              size={20}
              fill="currentColor"
              className={favorites.some(fav =>
                fav.coordinates.lat === selectedDestination.lat &&
                fav.coordinates.lng === selectedDestination.lng
              ) ? 'text-yellow-500' : 'text-gray-300'}
            />
          </button>
        </div>

        {showDetails && (
          <div className="px-4 pb-4">
            <p className="text-gray-600 mb-3">{selectedDestination.description}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Map size={14} />
              <span>Best time to visit: {selectedDestination.bestTime}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  playClick();
                  flyToDestination(selectedDestination);
                }}
                className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors"
              >
                Fly To
              </button>
              <button
                onClick={exploreDestination}
                className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
              >
                Explore
              </button>
            </div>
          </div>
        )}
      </div>
    )
  );

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-50">
          <div className="text-white text-lg">Loading globe...</div>
        </div>
      )}

      <div className="absolute inset-0">
        <Globe
          ref={globeRef}
          width={window.innerWidth}
          height={window.innerHeight}
          globeImageUrl={
            isNightMode
              ? "https://unpkg.com/three-globe/example/img/earth-night.jpg"
              : "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          }
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          showAtmosphere
          atmosphereColor={isNightMode ? "#333333" : "#63c8ff"}
          backgroundColor="#000000"
          pointsData={markers}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude="size"
          pointRadius={isMobile ? 0.4 : 0.5}
          pointResolution={16}
          pointLabel="label"
          arcsData={arcs}
          arcColor="color"
          arcDashLength="dashLength"
          arcDashAnimateTime="dashAnimateTime"
          arcStroke={isMobile ? 0.3 : 0.4}
          onGlobeReady={() => {
            setGlobeReady(true);
            setIsLoading(false);
          }}
          onPointClick={(point: any) => {
            playSelect();
            const dest = destinations.find(d =>
              d.lat === point.lat && d.lng === point.lng
            );
            if (dest) {
              handleDestinationSelect(dest);
            }
          }}
        />
      </div>

      {/* Desktop Controls (hidden on mobile) */}
      {!isMobile && (
        <>
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <button
              onClick={handleBackToHome}
              className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-gray-700 transition-colors"
              title="Go back to home"
              aria-label="Go back to home"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={() => handleZoom(-0.5)}
              className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-gray-700 transition-colors"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => handleZoom(0.5)}
              className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-gray-700 transition-colors"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={resetView}
              className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-gray-700 transition-colors"
              title="Reset view"
              aria-label="Reset view"
            >
              <Compass size={20} />
            </button>
          </div>
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-gray-700 transition-colors"
              title={isNightMode ? 'Day mode' : 'Night mode'}
              aria-label={isNightMode ? 'Switch to day mode' : 'Switch to night mode'}
            >
              {isNightMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-gray-700 transition-colors"
              title={autoRotate ? 'Stop rotation' : 'Start rotation'}
              aria-label={autoRotate ? 'Stop globe rotation' : 'Start globe rotation'}
            >
              <GlobeIcon size={20} className={autoRotate ? 'text-green-400' : 'text-gray-400'} />
            </button>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-gray-700 transition-colors"
              title="Show favorites"
              aria-label="Show favorite destinations"
            >
              <Star size={20} className={favorites.length > 0 ? 'text-yellow-400' : 'text-gray-400'} />
            </button>
            <button
              onClick={toggleSound}
              className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-gray-700 transition-colors"
              title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
              aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <button
              onClick={handleSpin}
              disabled={isSpinning || !globeReady}
              className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-lg transition-all ${isSpinning
                ? 'bg-gray-600 text-gray-300'
                : 'bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:shadow-xl'
                }`}
              title="Spin the globe to random destination"
              aria-label="Spin the globe"
            >
              <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              {isSpinning ? 'Spinning...' : 'Spin the Globe'}
            </button>
          </div>
        </>
      )}

      {/* Mobile-specific UI */}
      {isMobile && (
        <>
          {renderMobileControls()}
          {renderMobileDestinationCard()}
        </>
      )}

      {/* Destination Card (desktop) */}
      {!isMobile && renderDesktopDestinationCard()}

      {/* Favorites Panel */}
      {showFavorites && (
        <div className={`absolute ${isMobile ? 'top-1/4' : 'top-20 right-4'} ${isMobile ? 'w-[calc(100%-2rem)] mx-4' : 'w-64'} bg-white bg-opacity-90 rounded-xl shadow-2xl overflow-hidden z-10`}>
          <div className="p-4 bg-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Star className="text-yellow-500" size={18} />
              Favorite Destinations
            </h3>
            <button
              onClick={() => {
                playClick();
                setShowFavorites(false);
              }}
              className="p-1 text-gray-500 hover:text-gray-700"
              aria-label="Close favorites panel"
            >
              <X size={18} />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {favorites.length > 0 ? (
              favorites.map((fav: any, index: number) => (
                <div
                  key={index}
                  className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    const destMap: Destination = {
                      name: fav.name,
                      lat: fav.coordinates.lat,
                      lng: fav.coordinates.lng,
                      color: '#FF6B6B',
                      description: '',
                      bestTime: '',
                      link: ''
                    }
                    handleDestinationSelect(destMap);
                    setShowFavorites(false);
                  }}
                >
                  <div>
                    <h4 className="font-medium">{fav.name}</h4>
                    <p className="text-xs text-gray-500">{fav.coordinates?.lat?.toFixed(2)}, {fav.coordinates?.lng?.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(fav);
                    }}
                    className="p-1 text-gray-400 hover:text-yellow-500"
                    aria-label={`Remove ${fav.name} from favorites`}
                  >
                    <Star size={16} fill="currentColor" className="text-yellow-500" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No favorites yet. Click the star on destinations to add them.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobeSpinner;