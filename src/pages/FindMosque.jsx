import React, { useState, useEffect } from "react";
import {
  FaMosque,
  FaSearch,
  FaMapMarkerAlt,
  FaPhone,
  FaGlobe,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import axios from "axios";

function FindMosque() {
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  // Get user's current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const searchMosques = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Using OpenStreetMap Nominatim API for geocoding
      const geocodeResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );

      if (geocodeResponse.data.length > 0) {
        const { lat, lon } = geocodeResponse.data[0];

        // Using Overpass API to find mosques near the location
        const overpassQuery = `
          [out:json][timeout:25];
          (
            node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${lat},${lon});
            way["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${lat},${lon});
            relation["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${lat},${lon});
          );
          out body;
          >;
          out skel qt;
        `;

        const overpassResponse = await axios.get(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
            overpassQuery
          )}`
        );

        const mosqueData = overpassResponse.data.elements.map((mosque) => ({
          id: mosque.id,
          name: mosque.tags?.name || "Unnamed Mosque",
          address: mosque.tags?.address || "Address not available",
          phone: mosque.tags?.phone || "Phone not available",
          website: mosque.tags?.website || null,
          distance: calculateDistance(lat, lon, mosque.lat, mosque.lon),
        }));

        setMosques(mosqueData);
      }
    } catch (error) {
      setError("Error searching for mosques. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-emerald-800 dark:text-emerald-300 mb-4">
              Find Nearby Mosques
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Search for mosques in your area
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter location (e.g., Cairo, Egypt)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onKeyPress={(e) => e.key === "Enter" && searchMosques()}
              />
              <button
                onClick={searchMosques}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <FaSearch className="inline-block mr-2" />
                Search
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center text-gray-600 dark:text-gray-300">
              Searching for mosques...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Results */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mosques.map((mosque) => (
              <div
                key={mosque.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-emerald-600 dark:text-emerald-400">
                      <FaMosque className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {mosque.name}
                      </h3>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        {mosque.distance} km away
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                    <span>{mosque.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <FaPhone className="w-4 h-4 mr-2" />
                    <span>{mosque.phone}</span>
                  </div>
                  {mosque.website && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <FaGlobe className="w-4 h-4 mr-2" />
                      <a
                        href={mosque.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {!loading && !error && mosques.length === 0 && searchQuery && (
            <div className="text-center text-gray-600 dark:text-gray-300 mt-8">
              No mosques found in this area. Try searching in a different
              location.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default FindMosque;
