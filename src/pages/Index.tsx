import { useState, useEffect } from 'react';
import { Search, Star, Plus, Trash2, Loader2, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import WeatherDetailModal from '../components/ui/WeatherDetailModal';

interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    air_quality: {
      co: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      'us-epa-index': number;
    };
  };
}

interface CityData extends WeatherData {
  isBookmarked: boolean;
  id: string;
}

const WeatherApp = () => {
  const [cities, setCities] = useState<CityData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [bookmarkedCities, setBookmarkedCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [detailWeatherData, setDetailWeatherData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { toast } = useToast();

  const API_KEY = '65b898be84be415ebec183509252107';
  const API_BASE_URL = 'https://api.weatherapi.com/v1/current.json';
  const FORECAST_API_URL = 'https://api.weatherapi.com/v1/forecast.json';

  // Load bookmarked cities from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedCities');
    if (saved) {
      const bookmarked = JSON.parse(saved);
      setBookmarkedCities(bookmarked);
      // Load weather data for bookmarked cities
      bookmarked.forEach((cityName: string) => {
        fetchWeatherData(cityName, true);
      });
    }
  }, []);

  // Save bookmarked cities to localStorage
  useEffect(() => {
    localStorage.setItem('bookmarkedCities', JSON.stringify(bookmarkedCities));
  }, [bookmarkedCities]);

  const fetchWeatherData = async (cityName: string, isFromBookmark = false) => {
    if (!cityName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(cityName)}&aqi=yes`
      );
      
      if (!response.ok) throw new Error('City not found');
      
      const data: WeatherData = await response.json();
      const cityId = `${data.location.name}-${data.location.country}`;
      
      // Check if city already exists
      const existingCityIndex = cities.findIndex(city => city.id === cityId);
      const isBookmarked = bookmarkedCities.includes(data.location.name);
      
      const cityData: CityData = {
        ...data,
        isBookmarked,
        id: cityId
      };

      if (existingCityIndex >= 0) {
        // Update existing city
        setCities(prev => prev.map(city => 
          city.id === cityId ? cityData : city
        ));
      } else {
        // Add new city
        setCities(prev => [...prev, cityData]);
      }

      if (!isFromBookmark) {
        toast({
          title: "City Added",
          description: `Weather data loaded for ${data.location.name}`,
        });
      }

      setSearchQuery('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please check the city name.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoordinates = async (lat: number, lon: number) => {
    setLocationLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}?key=${API_KEY}&q=${lat},${lon}&aqi=yes`
      );
      
      if (!response.ok) throw new Error('Unable to fetch weather for current location');
      
      const data: WeatherData = await response.json();
      const cityId = `${data.location.name}-${data.location.country}-current`;
      
      // Check if city already exists
      const existingCityIndex = cities.findIndex(city => city.id === cityId);
      const isBookmarked = bookmarkedCities.includes(data.location.name);
      
      const cityData: CityData = {
        ...data,
        isBookmarked,
        id: cityId
      };

      if (existingCityIndex >= 0) {
        // Update existing city
        setCities(prev => prev.map(city => 
          city.id === cityId ? cityData : city
        ));
      } else {
        // Add new city at the beginning
        setCities(prev => [cityData, ...prev]);
      }

      toast({
        title: "Current Location Added",
        description: `Weather data loaded for your current location: ${data.location.name}`,
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Failed to fetch weather for current location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const getCurrentLocationWeather = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation feature.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoordinates(latitude, longitude);
      },
      (error) => {
        let message = "Unable to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied. Please allow location access and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherData(searchQuery);
  };

  const toggleBookmark = (cityName: string, cityId: string) => {
    setBookmarkedCities(prev => {
      const isCurrentlyBookmarked = prev.includes(cityName);
      const newBookmarked = isCurrentlyBookmarked
        ? prev.filter(name => name !== cityName)
        : [...prev, cityName];
      
      // Update cities state
      setCities(prevCities => prevCities.map(city =>
        city.id === cityId
          ? { ...city, isBookmarked: !isCurrentlyBookmarked }
          : city
      ));

      toast({
        title: isCurrentlyBookmarked ? "Bookmark Removed" : "City Bookmarked",
        description: `${cityName} ${isCurrentlyBookmarked ? 'removed from' : 'added to'} bookmarks`,
      });

      return newBookmarked;
    });
  };

  const removeCity = (cityId: string) => {
    setCities(prev => prev.filter(city => city.id !== cityId));
    toast({
      title: "City Removed",
      description: "City removed from your weather list",
    });
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return 'text-weather-hot';
    if (temp >= 20) return 'text-weather-warm';
    if (temp >= 10) return 'text-weather-cool';
    return 'text-weather-cold';
  };

  const getAirQualityLevel = (index: number) => {
    if (index <= 50) return { level: 'Good', color: 'text-green-600' };
    if (index <= 100) return { level: 'Moderate', color: 'text-yellow-600' };
    if (index <= 150) return { level: 'Unhealthy for Sensitive', color: 'text-orange-600' };
    if (index <= 200) return { level: 'Unhealthy', color: 'text-red-600' };
    if (index <= 300) return { level: 'Very Unhealthy', color: 'text-purple-600' };
    return { level: 'Hazardous', color: 'text-red-900' };
  };

  const fetchDetailedWeatherData = async (cityName: string) => {
    setDetailLoading(true);
    try {
      const response = await fetch(
        `${FORECAST_API_URL}?key=${API_KEY}&q=${encodeURIComponent(cityName)}&days=3&aqi=yes&alerts=no`
      );
      
      if (!response.ok) throw new Error('Failed to fetch detailed weather data');
      
      const data = await response.json();
      setDetailWeatherData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch detailed weather data.",
        variant: "destructive",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCityClick = (cityName: string) => {
    setSelectedCity(cityName);
    fetchDetailedWeatherData(cityName);
  };

  const closeDetailModal = () => {
    setSelectedCity(null);
    setDetailWeatherData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-sky">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Weather Dashboard</h1>
          <p className="text-muted-foreground">Track weather conditions for your favorite cities</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Current Location Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={getCurrentLocationWeather}
                  disabled={locationLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {locationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {locationLoading ? 'Getting Location...' : 'Add Current Location Weather'}
                </Button>
              </div>
              
              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Enter city name (e.g., London, New York, Tokyo)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={loading || !searchQuery.trim()}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add City
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Weather Cards Grid */}
        {cities.length === 0 ? (
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No cities added yet</h3>
                <p>Search for a city above to get started with weather tracking</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => {
              const airQuality = getAirQualityLevel(city.current.air_quality['us-epa-index']);
              
              return (
                <Card 
                  key={city.id} 
                  className="bg-gradient-card shadow-weather hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => handleCityClick(city.location.name)}
                >
                  <CardContent className="p-6">
                    {/* City Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{city.location.name}</h3>
                        <p className="text-muted-foreground text-sm">{city.location.country}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(city.location.name, city.id)}
                          className={city.isBookmarked ? 'text-accent hover:text-accent/80' : 'text-muted-foreground hover:text-accent'}
                        >
                          <Star className={`h-4 w-4 ${city.isBookmarked ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCity(city.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Weather Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={city.current.condition.icon} 
                          alt={city.current.condition.text}
                          className="w-12 h-12"
                        />
                        <div>
                          <div className={`text-3xl font-bold ${getTemperatureColor(city.current.temp_c)}`}>
                            {Math.round(city.current.temp_c)}°C
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round(city.current.temp_f)}°F
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground mb-4">
                      {city.current.condition.text}
                    </div>

                    {/* Weather Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Humidity</p>
                        <p className="font-semibold">{city.current.humidity}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Wind</p>
                        <p className="font-semibold">{city.current.wind_kph} km/h</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Air Quality</p>
                        <p className={`font-semibold ${airQuality.color}`}>
                          {airQuality.level} (AQI: {city.current.air_quality['us-epa-index']})
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Weather Detail Modal */}
        <WeatherDetailModal
          isOpen={selectedCity !== null}
          onClose={closeDetailModal}
          weatherData={detailWeatherData}
          loading={detailLoading}
        />
      </div>
    </div>
  );
};

export default WeatherApp;