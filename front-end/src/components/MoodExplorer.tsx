import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Search, Smile, Mountain, Book, Coffee, Heart, Umbrella,
  Plus, Check, MapPin, Star, Filter, Globe, TrendingUp,
  Clock, Calendar, Award, ChevronDown, ChevronUp, Home,
  Loader2, Info, Map, Plane, Flag, Sun, Moon, Settings,
  Snowflake, Landmark, Castle, Palmtree, Waves, Tent, ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useData } from '../context/DataContext';

interface Destination {
  id: string;
  name: string;
  image: string;
  description: string;
  coordinates: { lat: number; lng: number };
  mood: string[];
  bestTimeToVisit?: string;
  popularity?: number;
  budgetLevel?: 1 | 2 | 3;
  climate?: string;
  activities?: string[];
  continent?: string;
  travelTime?: string;
  highlights?: string[];
  rating?: number;
}

interface Mood {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bgColor: string;
}

interface MoodExplorerProps {
  onClose?: () => void;
  onAddDestination?: (destination: Destination) => void;
  onFlyTo?: (coordinates: { lat: number; lng: number }) => void;
  initialMoods?: string[];
}

const MOODS: Mood[] = [
  { id: 'adventurous', icon: Mountain, label: 'Adventurous', color: 'text-orange-500', bgColor: 'bg-orange-100' },
  { id: 'cultural', icon: Book, label: 'Cultural', color: 'text-purple-500', bgColor: 'bg-purple-100' },
  { id: 'relaxing', icon: Umbrella, label: 'Relaxing', color: 'text-blue-500', bgColor: 'bg-blue-100' },
  { id: 'romantic', icon: Heart, label: 'Romantic', color: 'text-pink-500', bgColor: 'bg-pink-100' },
  { id: 'local', icon: Coffee, label: 'Local Experience', color: 'text-green-500', bgColor: 'bg-green-100' },
  { id: 'beach', icon: Waves, label: 'Beach', color: 'text-cyan-500', bgColor: 'bg-cyan-100' },
  { id: 'shopping', icon: ShoppingBag, label: 'Shopping', color: 'text-fuchsia-500', bgColor: 'bg-fuchsia-100' },
];

const MoodExplorer: React.FC<MoodExplorerProps> = ({
  onClose,
  onAddDestination,
  onFlyTo,
  initialMoods = []
}) => {
  const navigate = useNavigate();
  const [selectedMoods, setSelectedMoods] = useState<string[]>(initialMoods);
  const [recommended, setRecommended] = useState<Destination[]>([]);
  const { destinations: bucketList, addDestination } = useData();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'popularity' | 'budget' | 'rating'>('popularity');
  const [budgetFilter, setBudgetFilter] = useState<number | null>(null);
  const [climateFilter, setClimateFilter] = useState<string | null>(null);
  const [continentFilter, setContinentFilter] = useState<string | null>(null);
  const [expandedDestination, setExpandedDestination] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  const handleImageLoad = (id: string) => {
    setImageLoaded(prev => ({ ...prev, [id]: true }));
  };

  const toggleDestinationExpand = (id: string) => {
    setExpandedDestination(expandedDestination === id ? null : id);
  };

  // Mock API call to fetch destinations
  const fetchDestinations = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock data with more destinations
      const mockResults: Destination[] = [
        {
          id: '1',
          name: "Patagonia, Argentina",
          image: "https://images.unsplash.com/photo-1508126239034-6e0eb1d2a0c7?w=800&auto=format&fit=crop&q=80",
          description: "Dramatic peaks and pristine wilderness for hiking and climbing",
          coordinates: { lat: -49.3270, lng: -72.8862 },
          mood: ['adventurous'],
          bestTimeToVisit: 'November to February',
          popularity: 85,
          budgetLevel: 2,
          climate: 'temperate',
          continent: 'South America',
          travelTime: '2+ weeks',
          activities: ['hiking', 'climbing', 'wildlife viewing'],
          highlights: ['Torres del Paine', 'Perito Moreno Glacier', 'Mount Fitz Roy'],
          rating: 4.8
        },
        {
          id: '2',
          name: "Kyoto, Japan",
          image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&auto=format&fit=crop&q=80",
          description: "Traditional temples and cherry blossoms in Japan's cultural heart",
          coordinates: { lat: 35.0116, lng: 135.7681 },
          mood: ['cultural', 'romantic'],
          bestTimeToVisit: 'March to May',
          popularity: 92,
          budgetLevel: 2,
          climate: 'temperate',
          continent: 'Asia',
          travelTime: '1-2 weeks',
          activities: ['temple visits', 'tea ceremonies', 'gardens'],
          highlights: ['Fushimi Inari Shrine', 'Arashiyama Bamboo Forest', 'Kinkaku-ji'],
          rating: 4.9
        },
        {
          id: '3',
          name: "Santorini, Greece",
          image: "https://images.unsplash.com/photo-1531590878845-12627191e687?w=800&auto=format&fit=crop&q=80",
          description: "Stunning white-washed buildings with blue domes overlooking the Aegean Sea",
          coordinates: { lat: 36.3932, lng: 25.4615 },
          mood: ['romantic', 'relaxing'],
          bestTimeToVisit: 'May to October',
          popularity: 95,
          budgetLevel: 3,
          climate: 'mediterranean',
          continent: 'Europe',
          travelTime: '1 week',
          activities: ['sunset viewing', 'wine tasting', 'beach relaxation'],
          highlights: ['Oia Sunset', 'Red Beach', 'Akrotiri Archaeological Site'],
          rating: 4.7
        },
        {
          id: '4',
          name: "Banff National Park, Canada",
          image: "https://images.unsplash.com/photo-1500581276021-a4bbcd0050c5?w=800&auto=format&fit=crop&q=80",
          description: "Majestic Rocky Mountain landscapes with turquoise lakes",
          coordinates: { lat: 51.4968, lng: -115.9281 },
          mood: ['adventurous', 'relaxing'],
          bestTimeToVisit: 'June to September',
          popularity: 88,
          budgetLevel: 2,
          climate: 'temperate',
          continent: 'North America',
          travelTime: '1-2 weeks',
          activities: ['hiking', 'wildlife spotting', 'hot springs'],
          highlights: ['Lake Louise', 'Moraine Lake', 'Icefields Parkway'],
          rating: 4.8
        },
        {
          id: '5',
          name: "Marrakech, Morocco",
          image: "https://images.unsplash.com/photo-1517825738774-7de9363ef735?w=800&auto=format&fit=crop&q=80",
          description: "Vibrant markets and historic architecture in Morocco's cultural hub",
          coordinates: { lat: 31.6295, lng: -7.9811 },
          mood: ['cultural', 'local'],
          bestTimeToVisit: 'March to May, September to November',
          popularity: 84,
          budgetLevel: 1,
          climate: 'arid',
          continent: 'Africa',
          travelTime: '1 week',
          activities: ['market shopping', 'historic tours', 'desert excursions'],
          highlights: ['Jemaa el-Fnaa', 'Bahia Palace', 'Majorelle Garden'],
          rating: 4.5
        },
        {
          id: '6',
          name: "Bora Bora, French Polynesia",
          image: "https://images.unsplash.com/photo-1579199311664-892456f60ea6?w=800&auto=format&fit=crop&q=80",
          description: "Luxury overwater bungalows in a tropical paradise",
          coordinates: { lat: -16.5004, lng: -151.7415 },
          mood: ['romantic', 'relaxing', 'beach'],
          bestTimeToVisit: 'May to October',
          popularity: 90,
          budgetLevel: 3,
          climate: 'tropical',
          continent: 'Oceania',
          travelTime: '1-2 weeks',
          activities: ['snorkeling', 'spa relaxation', 'lagoon tours'],
          highlights: ['Matira Beach', 'Mount Otemanu', 'Coral Gardens'],
          rating: 4.9
        },
        {
          id: '7',
          name: "New York City, USA",
          image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80",
          description: "The city that never sleeps with iconic landmarks and diverse culture",
          coordinates: { lat: 40.7128, lng: -74.0060 },
          mood: ['cultural', 'shopping'],
          bestTimeToVisit: 'April to June, September to November',
          popularity: 97,
          budgetLevel: 3,
          climate: 'temperate',
          continent: 'North America',
          travelTime: '3-5 days',
          activities: ['museum visits', 'shopping', 'broadway shows'],
          highlights: ['Times Square', 'Central Park', 'Statue of Liberty'],
          rating: 4.6
        }
      ];

      // Filter by selected moods if any
      const filteredResults = selectedMoods.length > 0
        ? mockResults.filter(dest =>
          dest.mood.some(mood => selectedMoods.includes(mood)))
        : mockResults;

      setRecommended(filteredResults);
      setImageLoaded({});
    } catch (error) {
      toast.error('Failed to load destinations');
      console.error('Error fetching destinations:', error);
      setRecommended([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate filteredRecommended using useMemo for better performance
  const filteredRecommended = useMemo(() => {
    let results = recommended.filter(dest =>
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dest.highlights && dest.highlights.some(highlight =>
        highlight.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    if (budgetFilter) {
      results = results.filter(dest => dest.budgetLevel && dest.budgetLevel <= budgetFilter);
    }

    if (climateFilter) {
      results = results.filter(dest => dest.climate === climateFilter);
    }

    if (continentFilter) {
      results = results.filter(dest => dest.continent === continentFilter);
    }

    // Sort results
    return results.sort((a, b) => {
      if (sortBy === 'popularity') {
        return (b.popularity || 0) - (a.popularity || 0);
      } else if (sortBy === 'budget') {
        return (a.budgetLevel || 3) - (b.budgetLevel || 3);
      } else {
        return (b.rating || 0) - (a.rating || 0);
      }
    });
  }, [recommended, searchQuery, budgetFilter, climateFilter, continentFilter, sortBy]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load initial data if moods are preselected
  useEffect(() => {
    if (selectedMoods.length > 0) {
      fetchDestinations();
    }
  }, []);

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const handleViewOnGlobe = (coordinates: { lat: number; lng: number }) => {
    if (onClose) onClose();
    setTimeout(() => {
      if (onFlyTo) onFlyTo(coordinates);
      toast.success(`Flying to destination!`);
    }, 300);
  };

  const handleAddToBucketList = async (destination: Destination) => {
    const isAdded = bucketList.some(d => d.name === destination.name);
    if (!isAdded) {
      if (onAddDestination) onAddDestination(destination);
      await addDestination({
        name: destination.name,
        coordinates: destination.coordinates
      });
      toast.success(`${destination.name} added to your bucket list!`);
    } else {
      toast('Already in your bucket list', { icon: 'ℹ️' });
    }
  };

  const handleGoBackToHome = () => {
    navigate('/');
  };

  const toggleNightMode = () => {
    setIsNightMode(!isNightMode);
    document.documentElement.classList.toggle('dark', !isNightMode);
  };

  const climateOptions = [
    { value: 'tropical', label: 'Tropical', icon: Sun },
    { value: 'temperate', label: 'Temperate', icon: Map },
    { value: 'mediterranean', label: 'Mediterranean', icon: Waves },
    { value: 'arid', label: 'Arid', icon: Landmark },
    { value: 'arctic', label: 'Cold', icon: Snowflake }
  ];

  const continentOptions = [
    { value: 'Africa', label: 'Africa', icon: Landmark },
    { value: 'Asia', label: 'Asia', icon: Castle },
    { value: 'Europe', label: 'Europe', icon: Landmark },
    { value: 'North America', label: 'North America', icon: Mountain },
    { value: 'South America', label: 'South America', icon: Palmtree },
    { value: 'Oceania', label: 'Oceania', icon: Waves }
  ];

  const budgetOptions = [
    { value: 1, label: 'Budget ($)', icon: '$' },
    { value: 2, label: 'Moderate ($$)', icon: '$$' },
    { value: 3, label: 'Luxury ($$$)', icon: '$$$' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 ${isNightMode ? 'bg-black/70' : 'bg-black/50'} flex items-center justify-center p-4 z-50`}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`${isNightMode ? 'dark bg-gray-900 text-white' : 'bg-white'} rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl`}
      >
        <div className={`p-6 border-b ${isNightMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between sticky top-0 ${isNightMode ? 'bg-gray-900' : 'bg-white'} z-10`}>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoBackToHome}
              className={`p-2 ${isNightMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              aria-label="Go back to home"
            >
              <Home className={`w-5 h-5 ${isNightMode ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>
            <Smile className={`w-6 h-6 ${isNightMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-2xl font-bold ${isNightMode ? 'text-white' : 'text-gray-800'}`}>Mood Explorer</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleNightMode}
              className={`p-2 ${isNightMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              aria-label={isNightMode ? 'Switch to day mode' : 'Switch to night mode'}
            >
              {isNightMode ? (
                <Sun className="w-5 h-5 text-yellow-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={() => { if (onClose) onClose(); }}
              className={`p-2 ${isNightMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              aria-label="Close explorer"
            >
              <X className={`w-5 h-5 ${isNightMode ? 'text-gray-300' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className={`${isNightMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            Select your travel mood(s) to discover perfect destinations!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
            {MOODS.map(({ id, icon: Icon, label, color, bgColor }) => (
              <motion.button
                key={id}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleMood(id)}
                className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${selectedMoods.includes(id)
                    ? `${bgColor} ${color} ring-2 ring-current`
                    : isNightMode
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                aria-label={`${selectedMoods.includes(id) ? 'Deselect' : 'Select'} ${label} mood`}
              >
                <Icon className="w-6 h-6" />
                <span className={`font-medium text-sm sm:text-base ${isNightMode ? 'text-white' : ''}`}>
                  {label}
                </span>
              </motion.button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchDestinations}
              disabled={selectedMoods.length === 0 || isLoading}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${selectedMoods.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              aria-label="Find destinations"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Find Destinations</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${showFilters
                  ? isNightMode
                    ? 'bg-gray-700'
                    : 'bg-gray-200'
                  : isNightMode
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              aria-label={`${showFilters ? 'Hide' : 'Show'} filters`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </motion.button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 p-4 ${isNightMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className={`font-medium mb-2 flex items-center gap-2 ${isNightMode ? 'text-gray-200' : ''}`}>
                    <TrendingUp className="w-4 h-4" />
                    Sort By
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortBy('popularity')}
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 ${sortBy === 'popularity'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                          : isNightMode
                            ? 'bg-gray-700 text-gray-200'
                            : 'bg-gray-200'
                        }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Popularity
                    </button>
                    <button
                      onClick={() => setSortBy('budget')}
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 ${sortBy === 'budget'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                          : isNightMode
                            ? 'bg-gray-700 text-gray-200'
                            : 'bg-gray-200'
                        }`}
                    >
                      <span>$</span>
                      Budget
                    </button>
                    <button
                      onClick={() => setSortBy('rating')}
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 ${sortBy === 'rating'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                          : isNightMode
                            ? 'bg-gray-700 text-gray-200'
                            : 'bg-gray-200'
                        }`}
                    >
                      <Star className="w-4 h-4" />
                      Rating
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 flex items-center gap-2 ${isNightMode ? 'text-gray-200' : ''}`}>
                    <span>$</span>
                    Max Budget
                  </h4>
                  <div className="flex gap-2">
                    {budgetOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setBudgetFilter(budgetFilter === option.value ? null : option.value)}
                        className={`px-3 py-2 rounded-lg flex items-center gap-2 ${budgetFilter === option.value
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                            : isNightMode
                              ? 'bg-gray-700 text-gray-200'
                              : 'bg-gray-200'
                          }`}
                      >
                        {option.icon}
                        {option.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 flex items-center gap-2 ${isNightMode ? 'text-gray-200' : ''}`}>
                    <Map className="w-4 h-4" />
                    Climate
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {climateOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setClimateFilter(climateFilter === option.value ? null : option.value)}
                        className={`px-3 py-2 rounded-lg flex items-center gap-2 ${climateFilter === option.value
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                            : isNightMode
                              ? 'bg-gray-700 text-gray-200'
                              : 'bg-gray-200'
                          }`}
                      >
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 flex items-center gap-2 ${isNightMode ? 'text-gray-200' : ''}`}>
                    <Globe className="w-4 h-4" />
                    Continent
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {continentOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setContinentFilter(continentFilter === option.value ? null : option.value)}
                        className={`px-3 py-2 rounded-lg flex items-center gap-2 ${continentFilter === option.value
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                            : isNightMode
                              ? 'bg-gray-700 text-gray-200'
                              : 'bg-gray-200'
                          }`}
                      >
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {isLoading && recommended.length === 0 ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`rounded-lg overflow-hidden ${isNightMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className={`h-40 sm:h-48 ${isNightMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
                  <div className="p-4">
                    <div className={`h-6 rounded ${isNightMode ? 'bg-gray-700' : 'bg-gray-200'} mb-2 w-3/4 animate-pulse`} />
                    <div className={`h-4 rounded ${isNightMode ? 'bg-gray-700' : 'bg-gray-200'} w-full animate-pulse`} />
                    <div className={`h-4 rounded ${isNightMode ? 'bg-gray-700' : 'bg-gray-200'} w-2/3 mt-2 animate-pulse`} />
                    <div className="flex gap-2 mt-3">
                      <div className={`h-6 w-24 rounded-full ${isNightMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
                      <div className={`h-6 w-24 rounded-full ${isNightMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recommended.length > 0 ? (
            <div className="mt-8">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${isNightMode ? 'text-white' : 'text-gray-800'}`}>
                  <Globe className={`w-5 h-5 ${isNightMode ? 'text-blue-400' : 'text-blue-500'}`} />
                  Recommended Destinations
                  <span className={`${isNightMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>
                    ({filteredRecommended.length})
                  </span>
                </h3>
                <div className="relative max-w-xs w-full">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isNightMode
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    aria-label="Search destinations"
                  />
                </div>
              </div>

              <AnimatePresence>
                {filteredRecommended.length > 0 ? (
                  <div className="grid gap-4">
                    {filteredRecommended.map((dest) => (
                      <motion.div
                        key={dest.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className={`rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${isNightMode ? 'bg-gray-800' : 'bg-gray-50'
                          }`}
                      >
                        <div className="relative h-40 sm:h-48">
                          {!imageLoaded[dest.id] && (
                            <div className={`absolute inset-0 ${isNightMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
                          )}
                          <img
                            src={dest.image}
                            alt={dest.name}
                            className={`w-full h-full object-cover ${!imageLoaded[dest.id] ? 'opacity-0' : 'opacity-100'}`}
                            loading="lazy"
                            onLoad={() => handleImageLoad(dest.id)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h4 className="text-white text-lg font-semibold">{dest.name}</h4>
                            <p className="text-white/90 text-sm line-clamp-1">{dest.description}</p>
                          </div>
                          <div className="absolute top-2 right-2 flex gap-2 flex-wrap justify-end">
                            {dest.mood.map(moodId => {
                              const mood = MOODS.find(m => m.id === moodId);
                              return mood ? (
                                <span
                                  key={moodId}
                                  className={`px-2 py-1 rounded-full text-xs ${mood.bgColor} ${mood.color}`}
                                >
                                  {mood.label}
                                </span>
                              ) : null;
                            })}
                          </div>
                          {dest.rating && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/70 rounded-full">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-white text-xs font-medium">{dest.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div
                            className="cursor-pointer"
                            onClick={() => toggleDestinationExpand(dest.id)}
                            aria-label={`${expandedDestination === dest.id ? 'Collapse' : 'Expand'} ${dest.name} details`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className={`flex items-center gap-2 text-sm ${isNightMode ? 'text-gray-300' : 'text-gray-600'
                                  }`}>
                                  <MapPin className="w-4 h-4" />
                                  <span>{dest.coordinates.lat.toFixed(4)}, {dest.coordinates.lng.toFixed(4)}</span>
                                </div>
                                {dest.bestTimeToVisit && (
                                  <div className={`hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded ${isNightMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    <Calendar className="w-3 h-3" />
                                    {dest.bestTimeToVisit}
                                  </div>
                                )}
                                {dest.popularity && (
                                  <div className={`hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded ${isNightMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-50 text-purple-600'
                                    }`}>
                                    <TrendingUp className="w-3 h-3" />
                                    {dest.popularity}%
                                  </div>
                                )}
                                {dest.budgetLevel && (
                                  <div className={`hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded ${isNightMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-600'
                                    }`}>
                                    <span>{'$'.repeat(dest.budgetLevel)}</span>
                                  </div>
                                )}
                              </div>
                              <button className={`${isNightMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                {expandedDestination === dest.id ? <ChevronUp /> : <ChevronDown />}
                              </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedDestination === dest.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`mt-3 pt-3 border-t ${isNightMode ? 'border-gray-700' : 'border-gray-200'
                                  }`}
                              >
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                  {dest.bestTimeToVisit && (
                                    <div className={`flex items-center gap-2 text-sm ${isNightMode ? 'text-gray-300' : 'text-gray-600'
                                      }`}>
                                      <Calendar className="w-4 h-4 text-blue-500" />
                                      <div>
                                        <p className={isNightMode ? 'text-gray-400' : 'text-gray-500'}>Best time</p>
                                        <p className="font-medium">{dest.bestTimeToVisit}</p>
                                      </div>
                                    </div>
                                  )}
                                  {dest.popularity && (
                                    <div className={`flex items-center gap-2 text-sm ${isNightMode ? 'text-gray-300' : 'text-gray-600'
                                      }`}>
                                      <TrendingUp className="w-4 h-4 text-purple-500" />
                                      <div>
                                        <p className={isNightMode ? 'text-gray-400' : 'text-gray-500'}>Popularity</p>
                                        <p className="font-medium">{dest.popularity}%</p>
                                      </div>
                                    </div>
                                  )}
                                  {dest.budgetLevel && (
                                    <div className={`flex items-center gap-2 text-sm ${isNightMode ? 'text-gray-300' : 'text-gray-600'
                                      }`}>
                                      <span className="w-4 h-4 text-green-500">$</span>
                                      <div>
                                        <p className={isNightMode ? 'text-gray-400' : 'text-gray-500'}>Budget</p>
                                        <p className="font-medium">{'$'.repeat(dest.budgetLevel)}</p>
                                      </div>
                                    </div>
                                  )}
                                  {dest.climate && (
                                    <div className={`flex items-center gap-2 text-sm ${isNightMode ? 'text-gray-300' : 'text-gray-600'
                                      }`}>
                                      <Sun className="w-4 h-4 text-yellow-500" />
                                      <div>
                                        <p className={isNightMode ? 'text-gray-400' : 'text-gray-500'}>Climate</p>
                                        <p className="font-medium capitalize">{dest.climate}</p>
                                      </div>
                                    </div>
                                  )}
                                  {dest.continent && (
                                    <div className={`flex items-center gap-2 text-sm ${isNightMode ? 'text-gray-300' : 'text-gray-600'
                                      }`}>
                                      <Globe className="w-4 h-4 text-cyan-500" />
                                      <div>
                                        <p className={isNightMode ? 'text-gray-400' : 'text-gray-500'}>Continent</p>
                                        <p className="font-medium">{dest.continent}</p>
                                      </div>
                                    </div>
                                  )}
                                  {dest.travelTime && (
                                    <div className={`flex items-center gap-2 text-sm ${isNightMode ? 'text-gray-300' : 'text-gray-600'
                                      }`}>
                                      <Clock className="w-4 h-4 text-indigo-500" />
                                      <div>
                                        <p className={isNightMode ? 'text-gray-400' : 'text-gray-500'}>Travel Time</p>
                                        <p className="font-medium">{dest.travelTime}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {dest.activities && dest.activities.length > 0 && (
                                  <div className="mb-3">
                                    <p className={`text-sm mb-2 ${isNightMode ? 'text-gray-400' : 'text-gray-500'
                                      }`}>Popular activities:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {dest.activities.map(activity => (
                                        <span
                                          key={activity}
                                          className={`px-2 py-1 rounded-full text-xs ${isNightMode
                                              ? 'bg-gray-700 text-gray-200'
                                              : 'bg-gray-200 text-gray-700'
                                            }`}
                                        >
                                          {activity}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {dest.highlights && dest.highlights.length > 0 && (
                                  <div className="mb-3">
                                    <p className={`text-sm mb-2 ${isNightMode ? 'text-gray-400' : 'text-gray-500'
                                      }`}>Must-see highlights:</p>
                                    <ul className={`space-y-1 list-disc list-inside ${isNightMode ? 'text-gray-300' : 'text-gray-600'
                                      }`}>
                                      {dest.highlights.map(highlight => (
                                        <li key={highlight} className="text-sm">
                                          {highlight}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                <div className="flex gap-3">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleViewOnGlobe(dest.coordinates)}
                                    className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${isNightMode
                                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                      }`}
                                    aria-label={`View ${dest.name} on globe`}
                                  >
                                    <Globe className="w-4 h-4" />
                                    <span>View on Globe</span>
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAddToBucketList(dest)}
                                    disabled={addedDestinations.includes(dest.id)}
                                    className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${addedDestinations.includes(dest.id)
                                        ? 'bg-green-600 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                      }`}
                                    aria-label={`${addedDestinations.includes(dest.id) ? 'Already added' : 'Add'} ${dest.name} to bucket list`}
                                  >
                                    {addedDestinations.includes(dest.id) ? (
                                      <>
                                        <Check className="w-4 h-4" />
                                        <span>Added</span>
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-4 h-4" />
                                        <span>Add to Bucket List</span>
                                      </>
                                    )}
                                  </motion.button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`py-8 text-center ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    <Search className="w-10 h-10 mx-auto mb-4" />
                    <p>No destinations match your search.</p>
                    <p>Try adjusting your filters or selecting different moods.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : selectedMoods.length > 0 && !isLoading ? (
            <div className={`py-12 text-center ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Info className="w-10 h-10 mx-auto mb-4" />
              <p>No destinations found for your selected moods.</p>
              <p>Try adjusting your filters or selecting different moods.</p>
            </div>
          ) : (
            <div className={`py-12 text-center ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Plane className="w-10 h-10 mx-auto mb-4" />
              <p>Select your travel moods to discover destinations!</p>
              <p>Choose from adventurous, cultural, relaxing, romantic, or local experiences.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MoodExplorer;