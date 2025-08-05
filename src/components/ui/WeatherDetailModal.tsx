import { X, Wind, Droplets, Eye, Thermometer, Sun, Moon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

interface ForecastDay {
  date: string;
  date_epoch: number;
  day: {
    maxtemp_c: number;
    maxtemp_f: number;
    mintemp_c: number;
    mintemp_f: number;
    avgtemp_c: number;
    avgtemp_f: number;
    maxwind_kph: number;
    totalprecip_mm: number;
    avghumidity: number;
    condition: {
      text: string;
      icon: string;
    };
  };
  hour: Array<{
    time: string;
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
    humidity: number;
    chance_of_rain: number;
  }>;
}

interface DetailedWeatherData {
  location: {
    name: string;
    country: string;
    region: string;
    localtime: string;
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
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    visibility_km: number;
    uv: number;
    feelslike_c: number;
    feelslike_f: number;
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
  forecast: {
    forecastday: ForecastDay[];
  };
}

interface WeatherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  weatherData: DetailedWeatherData | null;
  loading: boolean;
}

const WeatherDetailModal = ({ isOpen, onClose, weatherData, loading }: WeatherDetailModalProps) => {
  if (!isOpen) return null;

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

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-foreground">
            {weatherData ? `${weatherData.location.name}, ${weatherData.location.country}` : 'Weather Details'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading detailed weather...</p>
          </div>
        ) : weatherData ? (
          <div className="p-6 space-y-6">
            {/* Current Weather */}
            <Card className="bg-gradient-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Current Weather</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Main Weather Info */}
                  <div className="flex items-center gap-4">
                    <img 
                      src={weatherData.current.condition.icon} 
                      alt={weatherData.current.condition.text}
                      className="w-16 h-16"
                    />
                    <div>
                      <div className={`text-4xl font-bold ${getTemperatureColor(weatherData.current.temp_c)}`}>
                        {Math.round(weatherData.current.temp_c)}°C
                      </div>
                      <div className="text-lg text-muted-foreground">
                        {Math.round(weatherData.current.temp_f)}°F
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {weatherData.current.condition.text}
                      </div>
                    </div>
                  </div>

                  {/* Weather Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Feels like</p>
                        <p className="font-semibold">{Math.round(weatherData.current.feelslike_c)}°C</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Humidity</p>
                        <p className="font-semibold">{weatherData.current.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Wind</p>
                        <p className="font-semibold">{weatherData.current.wind_kph} km/h {weatherData.current.wind_dir}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Visibility</p>
                        <p className="font-semibold">{weatherData.current.visibility_km} km</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">UV Index</p>
                        <p className="font-semibold">{weatherData.current.uv}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pressure</p>
                      <p className="font-semibold">{weatherData.current.pressure_mb} mb</p>
                    </div>
                  </div>
                </div>

                {/* Air Quality */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3 text-foreground">Air Quality</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {(() => {
                      const airQuality = getAirQualityLevel(weatherData.current.air_quality['us-epa-index']);
                      return (
                        <>
                          <div>
                            <p className="text-muted-foreground">Overall</p>
                            <p className={`font-semibold ${airQuality.color}`}>
                              {airQuality.level}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">PM2.5</p>
                            <p className="font-semibold">{weatherData.current.air_quality.pm2_5.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">PM10</p>
                            <p className="font-semibold">{weatherData.current.air_quality.pm10.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">O3</p>
                            <p className="font-semibold">{weatherData.current.air_quality.o3.toFixed(1)}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3-Day Forecast */}
            <Card className="bg-gradient-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">3-Day Forecast</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {weatherData.forecast.forecastday.map((day, index) => (
                    <div key={day.date} className="p-4 rounded-lg bg-background/50 border">
                      <div className="text-center">
                        <p className="font-semibold text-foreground">
                          {index === 0 ? 'Today' : formatDate(day.date)}
                        </p>
                        <img 
                          src={day.day.condition.icon} 
                          alt={day.day.condition.text}
                          className="w-12 h-12 mx-auto my-2"
                        />
                        <p className="text-sm text-muted-foreground mb-2">
                          {day.day.condition.text}
                        </p>
                        <div className="space-y-1">
                          <div className={`font-bold ${getTemperatureColor(day.day.maxtemp_c)}`}>
                            {Math.round(day.day.maxtemp_c)}°C
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round(day.day.mintemp_c)}°C
                          </div>
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Wind:</span>
                            <span>{day.day.maxwind_kph} km/h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Humidity:</span>
                            <span>{day.day.avghumidity}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Today's Hourly Forecast */}
            <Card className="bg-gradient-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Today's Hourly Forecast</h3>
                <div className="overflow-x-auto">
                  <div className="flex gap-4 pb-4">
                    {weatherData.forecast.forecastday[0].hour
                      .filter((_, index) => index % 3 === 0) // Show every 3rd hour
                      .map((hour) => (
                      <div key={hour.time} className="min-w-[100px] text-center p-3 rounded-lg bg-background/50 border">
                        <p className="text-xs text-muted-foreground mb-2">
                          {formatTime(hour.time)}
                        </p>
                        <img 
                          src={hour.condition.icon} 
                          alt={hour.condition.text}
                          className="w-8 h-8 mx-auto mb-2"
                        />
                        <div className={`font-semibold ${getTemperatureColor(hour.temp_c)}`}>
                          {Math.round(hour.temp_c)}°
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {hour.chance_of_rain}% rain
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No weather data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherDetailModal;