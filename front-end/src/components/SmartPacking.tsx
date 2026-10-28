import React, { useState, useEffect, useMemo } from 'react';
import { 
  Luggage, Sun, Cloud, Umbrella, Mountain, Palmtree, 
  Building, Camera, Check, X, List, Save, ChevronLeft,
  Snowflake, Wind, CloudRain, CloudSun, Thermometer, CalendarDays
} from 'lucide-react';

interface PackingItem {
  category: string;
  items: string[];
}

interface PackingList {
  id: string;
  date: string;
  duration: number;
  weather: string[];
  activities: string[];
  items: PackingItem[];
}

interface SmartPackingProps {
  destination: {
    name: string;
    region: string;
    country: string;
    id: number;
  };
  onClose: () => void;
}

const weatherOptions = [
  { id: 'sunny', label: 'Sunny', icon: Sun, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'cloudy', label: 'Cloudy', icon: Cloud, color: 'bg-gray-100 text-gray-700' },
  { id: 'rainy', label: 'Rainy', icon: CloudRain, color: 'bg-blue-100 text-blue-700' },
  { id: 'windy', label: 'Windy', icon: Wind, color: 'bg-sky-100 text-sky-700' },
  { id: 'cold', label: 'Cold', icon: Snowflake, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'mixed', label: 'Mixed', icon: CloudSun, color: 'bg-purple-100 text-purple-700' },
];

const activityOptions = [
  { id: 'sightseeing', label: 'Sightseeing', icon: Camera, color: 'bg-amber-100 text-amber-700' },
  { id: 'hiking', label: 'Hiking', icon: Mountain, color: 'bg-green-100 text-green-700' },
  { id: 'beach', label: 'Beach', icon: Palmtree, color: 'bg-teal-100 text-teal-700' },
  { id: 'city', label: 'City', icon: Building, color: 'bg-gray-100 text-gray-700' },
  { id: 'business', label: 'Business', icon: Building, color: 'bg-blue-100 text-blue-700' },
  { id: 'adventure', label: 'Adventure', icon: Mountain, color: 'bg-orange-100 text-orange-700' },
];

const basePackingItems = {
  essentials: [
    'Passport/ID',
    'Travel Insurance Documents',
    'Credit Cards & Cash',
    'Phone & Charger',
    'Power Adapter',
    'Basic First Aid Kit',
    'Emergency Contacts',
    'Copies of Important Documents',
  ],
  clothing: [
    'Underwear',
    'Socks',
    'Pajamas',
    'Casual Shirts',
    'Pants/Shorts',
    'Outerwear',
    'Belt',
    'Swimwear',
  ],
  toiletries: [
    'Toothbrush & Toothpaste',
    'Shampoo & Conditioner',
    'Deodorant',
    'Sunscreen',
    'Hand Sanitizer',
    'Razor & Shaving Cream',
    'Hairbrush/Comb',
    'Makeup & Remover',
    'Prescription Medications',
  ],
};

const weatherSpecificItems = {
  sunny: [
    'Sunglasses',
    'Sun Hat',
    'Light Clothing',
    'Sunscreen SPF 50+',
    'After-Sun Lotion',
    'Lip Balm with SPF',
  ],
  cloudy: [
    'Light Jacket',
    'Long Sleeve Shirts',
    'Comfortable Shoes',
    'Light Scarf',
    'Layers',
  ],
  rainy: [
    'Rain Jacket',
    'Waterproof Shoes',
    'Umbrella',
    'Quick-Dry Clothing',
    'Waterproof Phone Case',
    'Plastic Bags for Wet Items',
  ],
  windy: [
    'Windbreaker',
    'Scarf',
    'Hat with Chin Strap',
    'Eye Protection',
  ],
  cold: [
    'Warm Jacket',
    'Thermal Underwear',
    'Gloves',
    'Warm Hat',
    'Scarf',
    'Winter Boots',
    'Hand Warmers',
  ],
  mixed: [
    'Layering Pieces',
    'Versatile Outerwear',
    'Convertible Pants',
    'All-Weather Shoes',
  ],
};

const activitySpecificItems = {
  sightseeing: [
    'Comfortable Walking Shoes',
    'Day Bag',
    'Camera',
    'Guide Book',
    'Water Bottle',
    'Portable Charger',
    'City Map',
  ],
  hiking: [
    'Hiking Boots',
    'Hiking Socks',
    'Trekking Poles',
    'Trail Mix/Snacks',
    'First Aid Kit',
    'Insect Repellent',
    'Hydration Pack',
    'Whistle',
  ],
  beach: [
    'Swimsuit',
    'Beach Towel',
    'Flip Flops',
    'Beach Bag',
    'Waterproof Sunscreen',
    'Beach Hat',
    'Waterproof Dry Bag',
    'Beach Cover-up',
  ],
  city: [
    'Smart Casual Outfits',
    'Comfortable City Shoes',
    'Small Daypack',
    'City Map',
    'Metro/Bus Pass',
    'Travel Guide',
  ],
  business: [
    'Business Attire',
    'Dress Shoes',
    'Portfolio/Briefcase',
    'Business Cards',
    'Laptop & Charger',
    'Notepad & Pen',
  ],
  adventure: [
    'Durable Clothing',
    'Sturdy Footwear',
    'Multi-tool',
    'Headlamp',
    'Dry Bags',
    'Quick-Dry Towel',
  ],
};

const SmartPacking: React.FC<SmartPackingProps> = ({ destination, onClose }) => {
  const [selectedWeather, setSelectedWeather] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [tripDuration, setTripDuration] = useState(7);
  const [showList, setShowList] = useState(false);
  const [savedLists, setSavedLists] = useState<PackingList[]>([]);
  const [viewingSavedList, setViewingSavedList] = useState(false);
  const [selectedList, setSelectedList] = useState<PackingList | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`packingLists_${destination.id}`) || '[]');
    setSavedLists(saved);
  }, [destination.id]);

  const generatePackingList = () => {
    let list: PackingItem[] = [
      { category: 'Essentials', items: [...basePackingItems.essentials] },
      { category: 'Clothing', items: [...basePackingItems.clothing] },
      { category: 'Toiletries', items: [...basePackingItems.toiletries] },
    ];

    // Add weather-specific items
    selectedWeather.forEach(weather => {
      const items = weatherSpecificItems[weather] || [];
      if (items.length > 0) {
        list.push({
          category: `${weather.charAt(0).toUpperCase() + weather.slice(1)} Weather Items`,
          items,
        });
      }
    });

    // Add activity-specific items
    selectedActivities.forEach(activity => {
      const items = activitySpecificItems[activity] || [];
      if (items.length > 0) {
        list.push({
          category: `${activity.charAt(0).toUpperCase() + activity.slice(1)} Items`,
          items,
        });
      }
    });

    // Adjust quantities based on trip duration
    list = list.map(category => ({
      ...category,
      items: category.items.map(item => {
        if (item.includes('Shirts') || item.includes('Socks') || item.includes('Underwear')) {
          return `${item} (${Math.ceil(tripDuration * 0.8)} pairs)`;
        }
        if (item.includes('Pants') || item.includes('Shorts')) {
          return `${item} (${Math.ceil(tripDuration * 0.5)} pairs)`;
        }
        return item;
      }),
    }));

    setPackingList(list);
    setShowList(true);
  };

  const savePackingList = () => {
    const newList: PackingList = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: tripDuration,
      weather: selectedWeather,
      activities: selectedActivities,
      items: packingList,
    };

    const updatedLists = [...savedLists, newList];
    localStorage.setItem(`packingLists_${destination.id}`, JSON.stringify(updatedLists));
    setSavedLists(updatedLists);
    setSelectedList(newList);
  };

  const toggleWeather = (weatherId: string) => {
    setSelectedWeather(prev =>
      prev.includes(weatherId)
        ? prev.filter(w => w !== weatherId)
        : [...prev, weatherId]
    );
  };

  const toggleActivity = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(a => a !== activityId)
        : [...prev, activityId]
    );
  };

  const deleteSavedList = (listId: string) => {
    const updatedLists = savedLists.filter(list => list.id !== listId);
    localStorage.setItem(`packingLists_${destination.id}`, JSON.stringify(updatedLists));
    setSavedLists(updatedLists);
    if (selectedList?.id === listId) setSelectedList(null);
  };

  const loadSavedList = (list: PackingList) => {
    setSelectedList(list);
    setTripDuration(list.duration);
    setSelectedWeather(list.weather);
    setSelectedActivities(list.activities);
    setPackingList(list.items);
    setShowList(true);
  };

  const canGenerateList = useMemo(() => 
    selectedWeather.length > 0 && selectedActivities.length > 0, 
    [selectedWeather, selectedActivities]
  );

  if (viewingSavedList) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-100 sticky top-0 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Saved Packing Lists</h2>
              </div>
              <button 
                onClick={() => setViewingSavedList(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close saved lists"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {savedLists.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No saved packing lists yet.
              </div>
            ) : (
              savedLists.map((list) => (
                <div key={list.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {new Date(list.date).toLocaleDateString()} - {list.duration} days
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {list.weather.map(w => {
                          const weather = weatherOptions.find(opt => opt.id === w);
                          return (
                            <span 
                              key={w} 
                              className={`text-sm px-2 py-1 rounded ${weather?.color || 'bg-gray-100 text-gray-700'}`}
                            >
                              {weather?.label || w}
                            </span>
                          );
                        })}
                        {list.activities.map(a => {
                          const activity = activityOptions.find(opt => opt.id === a);
                          return (
                            <span 
                              key={a} 
                              className={`text-sm px-2 py-1 rounded ${activity?.color || 'bg-gray-100 text-gray-700'}`}
                            >
                              {activity?.label || a}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadSavedList(list)}
                        className="text-blue-600 hover:text-blue-700"
                        aria-label="Load this list"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteSavedList(list.id)}
                        className="text-red-600 hover:text-red-700"
                        aria-label="Delete this list"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showList) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-100 sticky top-0 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowList(false);
                    setSelectedList(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                  aria-label="Back to options"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedList ? 'Your Saved Packing List' : 'Generated Packing List'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingSavedList(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                  aria-label="View saved lists"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Close packing assistant"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-gray-600">
              For {tripDuration} days in {destination.name}
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-2">
              {selectedWeather.map(w => {
                const weather = weatherOptions.find(opt => opt.id === w);
                return (
                  <span 
                    key={w} 
                    className={`text-sm px-2 py-1 rounded ${weather?.color || 'bg-gray-100 text-gray-700'}`}
                  >
                    {weather?.label || w}
                  </span>
                );
              })}
              {selectedActivities.map(a => {
                const activity = activityOptions.find(opt => opt.id === a);
                return (
                  <span 
                    key={a} 
                    className={`text-sm px-2 py-1 rounded ${activity?.color || 'bg-gray-100 text-gray-700'}`}
                  >
                    {activity?.label || a}
                  </span>
                );
              })}
            </div>

            <div className="space-y-6">
              {packingList.map((category, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-medium text-gray-800">{category.category}</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            id={`item-${index}-${itemIndex}`}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label 
                            htmlFor={`item-${index}-${itemIndex}`}
                            className="text-gray-700 flex-1"
                          >
                            {item}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {!selectedList && (
              <button
                onClick={savePackingList}
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save This Packing List
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Luggage className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Smart Packing Assistant</h2>
            </div>
            <div className="flex items-center gap-2">
              {savedLists.length > 0 && (
                <button
                  onClick={() => setViewingSavedList(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                  aria-label="View saved lists"
                >
                  <List className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close packing assistant"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-gray-600">
            Let's pack for {destination.name} {destination.country && `(${destination.country})`}
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Duration (days)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="30"
                value={tripDuration}
                onChange={(e) => setTripDuration(parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center gap-1 text-gray-700">
                <CalendarDays className="w-5 h-5" />
                <span className="font-medium">{tripDuration}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Weather
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {weatherOptions.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => toggleWeather(id)}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-colors ${color} ${
                    selectedWeather.includes(id)
                      ? 'border-blue-300 ring-2 ring-blue-200'
                      : 'hover:bg-opacity-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planned Activities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {activityOptions.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => toggleActivity(id)}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-colors ${color} ${
                    selectedActivities.includes(id)
                      ? 'border-blue-300 ring-2 ring-blue-200'
                      : 'hover:bg-opacity-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generatePackingList}
            disabled={!canGenerateList}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 ${
              canGenerateList
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Luggage className="w-5 h-5" />
            Generate Packing List
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartPacking;