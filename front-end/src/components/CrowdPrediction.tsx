import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Clock, AlertTriangle, Sun, 
  Cloud, Umbrella, Snowflake, Wind, X, Info 
} from 'lucide-react';

// Types
type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'snowy';
type CrowdLevel = 'low' | 'medium' | 'high' | 'very-high' | 'extreme';
type Season = 'spring' | 'summer' | 'fall' | 'winter';
type TimeOfDay = 'morning' | 'afternoon' | 'evening';

interface Prediction {
  level: CrowdLevel;
  message: string;
  tips: string[];
  specialEvent?: string;
}

// Historical crowd patterns based on seasons and times
const CROWD_PATTERNS: Record<Season, Record<TimeOfDay, CrowdLevel>> = {
  'summer': {
    'morning': 'high',
    'afternoon': 'very-high',
    'evening': 'high',
  },
  'winter': {
    'morning': 'low',
    'afternoon': 'medium',
    'evening': 'low',
  },
  'spring': {
    'morning': 'medium',
    'afternoon': 'high',
    'evening': 'medium',
  },
  'fall': {
    'morning': 'low',
    'afternoon': 'medium',
    'evening': 'low',
  }
};

// Special events that affect crowd levels
const SPECIAL_EVENTS: Record<string, Record<string, string>> = {
  'Paris': {
    'July 14': 'Bastille Day - Extremely crowded',
    'December 31': 'New Year\'s Eve - Extremely crowded',
    'April 1': 'April Fools Day - Busier than usual'
  },
  'Rome': {
    'December 25': 'Christmas - Extremely crowded',
    'Easter': 'Easter Week - Extremely crowded',
    'June 2': 'Republic Day - Very crowded'
  },
  'Tokyo': {
    'March 20': 'Cherry Blossom Season Start - Very crowded',
    'April 10': 'Cherry Blossom Peak - Extremely crowded',
    'November 15': 'Shichi-Go-San Festival - Crowded'
  },
  'New York': {
    'July 4': 'Independence Day - Extremely crowded',
    'December 31': 'New Year\'s Eve - Extremely crowded',
    'November 24': 'Thanksgiving Weekend - Very crowded'
  }
};

// Weather impact on crowd levels
const WEATHER_IMPACT: Record<WeatherType, number> = {
  'sunny': 1.2,
  'cloudy': 1,
  'rainy': 0.7,
  'windy': 0.8,
  'snowy': 0.5
};

// Tips based on crowd levels
const CROWD_TIPS: Record<CrowdLevel, string[]> = {
  'low': [
    'Perfect time for photography without crowds',
    'Enjoy shorter wait times for attractions',
    'Consider guided tours for deeper insights'
  ],
  'medium': [
    'Visit early in your chosen time window',
    'Weekdays are better than weekends',
    'Consider guided tours to skip lines'
  ],
  'high': [
    'Book skip-the-line tickets in advance',
    'Visit less popular attractions first',
    'Early mornings typically have fewer crowds'
  ],
  'very-high': [
    'Purchase fast-track tickets well in advance',
    'Consider visiting during meal times',
    'Explore alternative nearby attractions'
  ],
  'extreme': [
    'Expect long wait times everywhere',
    'Consider rescheduling if possible',
    'Book VIP experiences to bypass crowds'
  ]
};

interface CrowdPredictionProps {
  destination: string;
  onClose: () => void;
}

const CrowdPrediction: React.FC<CrowdPredictionProps> = ({ destination, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set default time to current time when component mounts
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setSelectedTime(`${hours}:${minutes}`);
  }, []);

  const getSeason = (date: string): Season => {
    const month = new Date(date).getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  const getTimeOfDay = (time: string): TimeOfDay => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  };

  const getSpecialEvent = (date: string): string | null => {
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const day = dateObj.getDate();
    const monthDay = `${month} ${day}`;
    
    // Check fixed date events
    if (SPECIAL_EVENTS[destination]?.[monthDay]) {
      return SPECIAL_EVENTS[destination][monthDay];
    }
    
    // Check Easter (variable date)
    if (month === 'March' || month === 'April') {
      const easterDate = calculateEaster(dateObj.getFullYear());
      if (dateObj.toDateString() === easterDate.toDateString()) {
        return 'Easter Sunday - Extremely crowded';
      }
      
      // Check Easter week
      const easterWeekStart = new Date(easterDate);
      easterWeekStart.setDate(easterWeekStart.getDate() - 7);
      if (dateObj >= easterWeekStart && dateObj <= easterDate) {
        return 'Easter Week - Extremely crowded';
      }
    }
    
    return null;
  };

  // Helper function to calculate Easter Sunday
  const calculateEaster = (year: number): Date => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  };

  const predictCrowds = () => {
    if (!selectedDate || !selectedTime) return;
    
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const season = getSeason(selectedDate);
      const timeOfDay = getTimeOfDay(selectedTime);
      const baseLevel = CROWD_PATTERNS[season][timeOfDay];
      
      // Check for special events
      const specialEvent = getSpecialEvent(selectedDate);
      
      // Calculate crowd level
      let level: CrowdLevel = baseLevel;
      let message = '';
      const tips = [...CROWD_TIPS[baseLevel]];
      
      if (specialEvent) {
        level = 'extreme';
        message = specialEvent;
        tips.unshift('Consider visiting on a different date');
        tips.unshift('Book tickets well in advance');
      } else {
        const weatherMultiplier = WEATHER_IMPACT[weather];
        
        // Adjust level based on weather
        if (weatherMultiplier > 1 && level !== 'extreme') {
          if (level === 'low') level = 'medium';
          else if (level === 'medium') level = 'high';
          else if (level === 'high') level = 'very-high';
        } else if (weatherMultiplier < 1 && level !== 'low') {
          if (level === 'very-high') level = 'high';
          else if (level === 'high') level = 'medium';
          else if (level === 'medium') level = 'low';
        }
        
        // Generate appropriate message
        switch (level) {
          case 'low':
            message = 'Perfect time to visit! Expect minimal crowds.';
            break;
          case 'medium':
            message = 'Moderate crowd levels expected.';
            break;
          case 'high':
            message = 'Expect significant crowds during this time.';
            break;
          case 'very-high':
            message = 'Peak crowds expected. Plan accordingly.';
            break;
        }
        
        // Add weather-specific tips
        if (weather === 'rainy') {
          tips.push('Bring waterproof gear and umbrellas');
        } else if (weather === 'sunny') {
          tips.push('Wear sunscreen and stay hydrated');
        }
      }
      
      setPrediction({ level, message, tips, specialEvent });
      setIsLoading(false);
    }, 800);
  };

  const getCrowdLevelColor = (level: CrowdLevel): string => {
    const colors = {
      'low': 'bg-green-100 text-green-800 border-green-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'very-high': 'bg-red-100 text-red-800 border-red-200',
      'extreme': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[level];
  };

  const getWeatherIcon = (weatherType: WeatherType) => {
    switch (weatherType) {
      case 'sunny': return <Sun className="w-4 h-4" />;
      case 'cloudy': return <Cloud className="w-4 h-4" />;
      case 'rainy': return <Umbrella className="w-4 h-4" />;
      case 'windy': return <Wind className="w-4 h-4" />;
      case 'snowy': return <Snowflake className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Crowd Prediction</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close crowd prediction"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="mt-2 text-gray-600">Predict crowd levels for {destination}</p>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Date Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPrediction(null);
                }}
                className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Time Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select Time</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                  setPrediction(null);
                }}
                className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Weather Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Expected Weather</label>
            <div className="grid grid-cols-3 gap-2">
              {(['sunny', 'cloudy', 'rainy', 'windy', 'snowy'] as WeatherType[]).map((weatherType) => (
                <button
                  key={weatherType}
                  onClick={() => {
                    setWeather(weatherType);
                    setPrediction(null);
                  }}
                  className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                    weather === weatherType
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  aria-label={`Select ${weatherType} weather`}
                >
                  {getWeatherIcon(weatherType)}
                  <span className="text-xs capitalize">{weatherType}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Predict Button */}
          <button
            onClick={predictCrowds}
            disabled={!selectedDate || !selectedTime || isLoading}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
              (selectedDate && selectedTime && !isLoading)
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Predicting...
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                Predict Crowds
              </>
            )}
          </button>

          {/* Prediction Results */}
          {prediction && (
            <div className="space-y-4 animate-fade-in">
              {/* Crowd Level */}
              <div className={`p-4 rounded-lg border ${getCrowdLevelColor(prediction.level)}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">Crowd Level: {prediction.level.toUpperCase()}</h3>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full mx-0.5 ${
                          i < ['low', 'medium', 'high', 'very-high', 'extreme'].indexOf(prediction.level) + 1
                            ? prediction.level === 'low' ? 'bg-green-500' :
                              prediction.level === 'medium' ? 'bg-yellow-500' :
                              prediction.level === 'high' ? 'bg-orange-500' :
                              prediction.level === 'very-high' ? 'bg-red-500' : 'bg-purple-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2">{prediction.message}</p>
                {prediction.specialEvent && (
                  <div className="mt-2 flex items-start gap-2 bg-white/50 p-2 rounded">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                    <span className="text-sm text-yellow-800">{prediction.specialEvent}</span>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Smart Tips for Your Visit
                </h4>
                <ul className="space-y-3">
                  {prediction.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                        index < 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Best Times */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Best Times to Visit</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <div className="text-xs text-blue-600">Best Season</div>
                    <div className="font-medium">Fall</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <div className="text-xs text-blue-600">Best Time of Day</div>
                    <div className="font-medium">Morning</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrowdPrediction;