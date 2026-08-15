import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, Heart, MessageCircle, Calendar, Search, Sparkles, UserPlus, Globe, Plane, Camera, Utensils, Music, ShoppingBag, Mountain, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const interestOptions = [
  { id: "adventure", label: "Adventure", icon: Mountain },
  { id: "trekking", label: "Trekking", icon: Mountain },
  { id: "beaches", label: "Beaches", icon: Waves },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "culture", label: "Culture", icon: Globe },
  { id: "food", label: "Food", icon: Utensils },
  { id: "nightlife", label: "Nightlife", icon: Music },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "solo", label: "Solo Travel", icon: Users },
  { id: "group", label: "Group Travel", icon: Users }
];

export default function Connect() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    interests: [],
    travel_style: "",
    current_destination: "",
    travel_dates: { start: "", end: "" },
    languages: [],
    age_preference: "",
    budget_range: ""
  });

  useEffect(() => {
    loadUserAndMatches();
  }, []);

  const loadUserAndMatches = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Check if profile is complete
      if (!currentUser.interests || currentUser.interests.length === 0) {
        setShowProfileSetup(true);
      } else {
        setProfileData({
          interests: currentUser.interests || [],
          travel_style: currentUser.travel_style || "",
          current_destination: currentUser.current_destination || "",
          travel_dates: currentUser.travel_dates || { start: "", end: "" },
          languages: currentUser.languages || [],
          age_preference: currentUser.age_preference || "",
          budget_range: currentUser.budget_range || ""
        });
        await findMatches(currentUser);
      }
    } catch (error) {
      navigate(createPageUrl("Auth"));
    }
  };

  const toggleInterest = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const saveProfile = async () => {
    try {
      await base44.auth.updateMe({
        ...profileData,
        connect_opt_in: true
      });
      setShowProfileSetup(false);
      const updatedUser = await base44.auth.me();
      await findMatches(updatedUser);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const findMatches = async (currentUser) => {
    if (!currentUser.current_destination || !currentUser.interests || currentUser.interests.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const prompt = `Generate 8 realistic travel companions for matching with a user going to ${currentUser.current_destination}.

User Profile:
- Interests: ${currentUser.interests.join(", ")}
- Travel Dates: ${currentUser.travel_dates?.start} to ${currentUser.travel_dates?.end}
- Travel Style: ${currentUser.travel_style}
- Languages: ${currentUser.languages?.join(", ")}

For each match provide:
- name, age (similar age range), profile_photo (placeholder), location
- interests (array, must overlap with user's interests)
- current_destination (same as user: ${currentUser.current_destination})
- travel_dates (object with start and end, overlapping with user)
- travel_style
- languages (array, at least one common language)
- bio (short, friendly)
- match_score (number 1-100, based on interest overlap)
- common_interests (array of overlapping interests)

Sort by match_score descending. Make matches realistic and diverse.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  age: { type: "number" },
                  profile_photo: { type: "string" },
                  location: { type: "string" },
                  interests: { type: "array", items: { type: "string" } },
                  current_destination: { type: "string" },
                  travel_dates: {
                    type: "object",
                    properties: {
                      start: { type: "string" },
                      end: { type: "string" }
                    }
                  },
                  travel_style: { type: "string" },
                  languages: { type: "array", items: { type: "string" } },
                  bio: { type: "string" },
                  match_score: { type: "number" },
                  common_interests: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setMatches(response.matches || []);
    } catch (error) {
      console.error("Error finding matches:", error);
    }
    setLoading(false);
  };

  const connectWithUser = (match) => {
    alert(`✅ Connection request sent to ${match.name}!\n\n🎯 Match Score: ${match.match_score}%\n✨ You both love: ${match.common_interests.join(", ")}`);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 relative">
      {/* Light Pastel Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Connect & Travel</h1>
          </div>
          <p className="text-gray-700">Find your perfect travel companions based on shared interests</p>
        </motion.div>

        {/* Profile Setup Modal */}
        <AnimatePresence>
          {showProfileSetup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowProfileSetup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-strong rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ Complete Your Travel Profile</h2>

                {/* Interests Selection */}
                <div className="mb-6">
                  <Label className="text-base font-semibold text-gray-900 mb-3 block">What are your travel interests?</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {interestOptions.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => toggleInterest(id)}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          profileData.interests.includes(id)
                            ? "bg-gradient-to-br from-cyan-500 to-blue-500 border-blue-500 text-white shadow-lg scale-105"
                            : "bg-white border-gray-200 text-gray-700 hover:border-blue-300"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium text-center">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destination */}
                <div className="mb-4">
                  <Label className="mb-2 block text-gray-900">Current/Planned Destination</Label>
                  <Input
                    placeholder="e.g., Bali, Indonesia"
                    value={profileData.current_destination}
                    onChange={(e) => setProfileData({ ...profileData, current_destination: e.target.value })}
                    className="rounded-xl border-gray-300"
                  />
                </div>

                {/* Travel Dates */}
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="mb-2 block text-gray-900">Start Date</Label>
                    <Input
                      type="date"
                      value={profileData.travel_dates.start}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        travel_dates: { ...profileData.travel_dates, start: e.target.value }
                      })}
                      className="rounded-xl border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block text-gray-900">End Date</Label>
                    <Input
                      type="date"
                      value={profileData.travel_dates.end}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        travel_dates: { ...profileData.travel_dates, end: e.target.value }
                      })}
                      className="rounded-xl border-gray-300"
                    />
                  </div>
                </div>

                {/* Travel Style */}
                <div className="mb-4">
                  <Label className="mb-2 block text-gray-900">Travel Style</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Solo", "Group", "Budget", "Luxury", "Adventure", "Cultural"].map(style => (
                      <button
                        key={style}
                        onClick={() => setProfileData({ ...profileData, travel_style: style })}
                        className={`px-4 py-2 rounded-xl transition-all ${
                          profileData.travel_style === style
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                            : "bg-white border border-gray-300 text-gray-700 hover:border-blue-300"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="mb-6">
                  <Label className="mb-2 block text-gray-900">Languages (comma separated)</Label>
                  <Input
                    placeholder="e.g., English, Spanish, Hindi"
                    value={profileData.languages.join(", ")}
                    onChange={(e) => setProfileData({ 
                      ...profileData, 
                      languages: e.target.value.split(",").map(l => l.trim()).filter(Boolean)
                    })}
                    className="rounded-xl border-gray-300"
                  />
                </div>

                <Button
                  onClick={saveProfile}
                  disabled={profileData.interests.length === 0 || !profileData.current_destination}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg rounded-xl h-12 text-lg font-semibold"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Find My Travel Matches
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Matches Display */}
        {!showProfileSetup && (
          <>
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-strong rounded-3xl p-6 mb-6 shadow-xl border border-white/50"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-600 mb-1">Your Destination</p>
                  <p className="text-xl font-bold text-gray-900">
                    <MapPin className="w-5 h-5 inline mr-1" />
                    {profileData.current_destination || "Not set"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Interests</p>
                  <p className="text-xl font-bold text-gray-900">{profileData.interests.length}</p>
                </div>
                <Button
                  onClick={() => setShowProfileSetup(true)}
                  variant="outline"
                  className="rounded-xl border-blue-300 hover:bg-blue-50"
                >
                  Edit Profile
                </Button>
              </div>
            </motion.div>

            {/* Matches Grid */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-700 font-medium">Finding your perfect matches...</p>
                </motion.div>
              ) : matches.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-strong rounded-3xl p-12 shadow-xl text-center"
                >
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete your profile to find matches</h3>
                  <Button
                    onClick={() => setShowProfileSetup(true)}
                    className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl"
                  >
                    Set Up Profile
                  </Button>
                </motion.div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {matches.map((match, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-strong rounded-2xl p-5 shadow-lg border border-white/50 hover:shadow-xl transition-all hover:scale-105"
                    >
                      {/* Match Score Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                          <Users className="w-7 h-7 text-white" />
                        </div>
                        <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          {match.match_score}% Match
                        </div>
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg mb-1">{match.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{match.age} yrs • {match.location}</p>

                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{match.current_destination}</span>
                      </div>

                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{match.bio}</p>

                      {/* Common Interests */}
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-1">You both love:</p>
                        <div className="flex flex-wrap gap-1">
                          {match.common_interests.slice(0, 3).map((interest, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 rounded-full text-xs font-medium"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Travel Dates */}
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-4">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(match.travel_dates.start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(match.travel_dates.end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => connectWithUser(match)}
                          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg rounded-xl h-9 text-sm"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Connect
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-xl border-blue-300 hover:bg-blue-50 h-9 px-3"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}