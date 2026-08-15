import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Plane, MapPin, Shield, Users, Sparkles, Cloud, Sun, CloudRain, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function Home() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        await base44.auth.me();
        navigate(createPageUrl("Dashboard"));
      } catch (error) {
        // Not logged in, stay on home page
      }
    };
    checkAuth();
  }, [navigate]);

  const detectLocation = () => {
    setLoadingWeather(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await fetchWeather(latitude, longitude);
        },
        (error) => {
          console.error("Error detecting location:", error);
          setLoadingWeather(false);
        }
      );
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Get current weather for coordinates ${lat}, ${lon}. Return only: city name, temperature in Celsius, and weather condition (sunny/cloudy/rainy/stormy).`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            city: { type: "string" },
            temperature: { type: "number" },
            condition: { type: "string" }
          }
        }
      });
      setWeather(response);
      setLocation(response.city);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
    setLoadingWeather(false);
  };

  const handleManualLocation = async () => {
    if (!location.trim()) return;
    setLoadingWeather(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Get current weather for ${location}. Return only: city name, temperature in Celsius, and weather condition (sunny/cloudy/rainy/stormy).`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            city: { type: "string" },
            temperature: { type: "number" },
            condition: { type: "string" }
          }
        }
      });
      setWeather(response);
      setLocation(response.city);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
    setLoadingWeather(false);
  };

  const getWeatherIcon = (condition) => {
    const cond = condition?.toLowerCase() || "";
    if (cond.includes("rain")) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (cond.includes("cloud")) return <Cloud className="w-8 h-8 text-gray-500" />;
    return <Sun className="w-8 h-8 text-yellow-500" />;
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI Trip Planning",
      description: "Get personalized itineraries powered by AI for any destination",
      color: "from-purple-400 to-pink-400"
    },
    {
      icon: Users,
      title: "AI Travel Assistant",
      description: "Chat with our AI for instant travel tips and recommendations",
      color: "from-blue-400 to-cyan-400"
    },
    {
      icon: Shield,
      title: "Live Safety Tools",
      description: "SOS alerts and real-time location sharing with emergency contacts",
      color: "from-red-400 to-orange-400"
    },
    {
      icon: MapPin,
      title: "Community Reviews",
      description: "Share experiences and discover places through traveler stories",
      color: "from-green-400 to-emerald-400"
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Travel Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/60 via-teal-900/50 to-purple-900/60 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-sky-950/80" />
      </div>

      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-20 h-20 bg-gradient-to-br from-sky-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <Plane className="w-10 h-10 text-white" />
            </motion.div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl animate-gradient">
              Travel Companion
            </span>
          </h1>
          
          <p className="text-2xl sm:text-3xl text-white font-semibold mb-4 drop-shadow-lg">
            Plan Smart. Travel Safe. Connect Freely.
          </p>
          
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-12 drop-shadow-md">
            Your AI-powered travel partner that helps you discover amazing destinations,
            plan perfect trips, and stay safe wherever you go.
          </p>

          {/* Location & Weather */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-md mx-auto mb-8"
          >
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter your city..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
                className="rounded-xl border-sky-200 focus:border-sky-400"
              />
              <Button
                onClick={detectLocation}
                variant="outline"
                className="rounded-xl border-sky-300 hover:bg-sky-50"
                disabled={loadingWeather}
              >
                <Navigation className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleManualLocation}
                className="rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 hover:shadow-lg"
                disabled={loadingWeather}
              >
                Get Weather
              </Button>
            </div>

            {weather && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-strong rounded-2xl p-4 shadow-2xl neon-blue"
              >
                <div className="flex items-center justify-center gap-3">
                  {getWeatherIcon(weather.condition)}
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{weather.temperature}°C</p>
                    <p className="text-sm text-gray-600">{weather.city}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 capitalize">{weather.condition}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={() => navigate(createPageUrl("Auth"))}
              className="px-8 py-6 text-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:shadow-2xl rounded-2xl transform hover:scale-105 transition-all duration-300 neon-blue animate-pulse-glow font-bold"
            >
              🚀 Get Started - It's Free
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.05, transition: { duration: 0.2 } }}
                className="glass-strong rounded-3xl p-6 shadow-2xl border border-white/30 hover:shadow-cyan-500/20 hover:neon-blue transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 rounded-3xl p-8 sm:p-12 text-center shadow-2xl"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-xl text-white/90 mb-6">
            Join thousands of smart travelers using AI to plan their perfect trips
          </p>
          <Button
            onClick={() => navigate(createPageUrl("Auth"))}
            className="px-8 py-6 text-lg bg-white text-sky-600 hover:bg-gray-50 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-xl"
          >
            Start Planning Now
          </Button>
        </motion.div>
      </div>
    </div>
  );
}