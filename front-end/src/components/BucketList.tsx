import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { useData } from "../context/DataContext";

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const BucketList = () => {
  const navigate = useNavigate();
  const { destinations, addDestination, deleteDestination } = useData();
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState<string | null>(null); // New state to store distance

  const OPENROUTESERVICE_API_KEY = import.meta.env.VITE_OPENROUTESERVICE_API_KEY;
  const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Fetch coordinates for a destination
  const fetchCoordinates = async (destinationName: string) => {
    try {
      // Try OpenRouteService first
      const orsResponse = await axios.get(
        `https://api.openrouteservice.org/geocode/search?api_key=${OPENROUTESERVICE_API_KEY}&text=${destinationName}`
      );

      let coordinates = orsResponse.data.features[0]?.geometry?.coordinates;

      if (coordinates) {
        return { lat: coordinates[1], lng: coordinates[0] };
      }

      // Fallback to Nominatim (OpenStreetMap) if ORS finds nothing
      console.log("ORS failed to find location, trying Nominatim fallback...");
      const nominatimResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationName)}`
      );

      if (nominatimResponse.data && nominatimResponse.data.length > 0) {
        return {
          lat: parseFloat(nominatimResponse.data[0].lat),
          lng: parseFloat(nominatimResponse.data[0].lon)
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching coordinates:", error);

      // Try Nominatim as a last resort if ORS threw an network error
      try {
        const nominatimResponse = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationName)}`
        );
        if (nominatimResponse.data && nominatimResponse.data.length > 0) {
          return {
            lat: parseFloat(nominatimResponse.data[0].lat),
            lng: parseFloat(nominatimResponse.data[0].lon)
          };
        }
      } catch (fallbackError) {
        console.error("Fallback Nominatim error:", fallbackError);
      }

      return null;
    }
  };

  // Fetch weather data
  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      return {
        temp: response.data.main.temp,
        condition: response.data.weather[0].description,
      };
    } catch (error) {
      console.error("Error fetching weather:", error);
      return null;
    }
  };

  // Add new destination
  const handleAddDestination = async () => {
    const destinationName = prompt("Enter destination name:");
    if (!destinationName) return;

    const coordinates = await fetchCoordinates(destinationName);
    if (!coordinates) {
      alert("Invalid destination. Try again.");
      return;
    }

    const weather = await fetchWeather(coordinates.lat, coordinates.lng);
    await addDestination({
      name: destinationName,
      coordinates,
      weather: weather || undefined,
    });
  };

  // Delete a destination
  const handleDeleteDestination = async (id: string | undefined) => {
    if (id) {
      await deleteDestination(id);
    }
  };

  // Fetch route from OpenRouteService
  const getRoute = async () => {
    if (destinations.length < 2) {
      setRoute([]);
      setDistance(null);
      return;
    }

    try {
      const coordinates = destinations.map((d) => [d.coordinates.lng, d.coordinates.lat]);
      console.log("Sending coordinates:", coordinates);

      let routeCoords: any = [];
      let routeDistanceInKilometers = 0;

      try {
        const response = await axios.post(
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
          { coordinates },
          {
            headers: { Authorization: OPENROUTESERVICE_API_KEY, "Content-Type": "application/json" },
          }
        );

        const feature = response.data.features?.[0];
        routeCoords = feature?.geometry?.coordinates?.map(([lng, lat]: [number, number]) => [lat, lng]) || [];

        if (routeCoords.length === 0) {
          throw new Error("No coordinates returned from ORS");
        }

        const routeDistanceInMeters = feature?.properties?.summary?.distance || 0;
        routeDistanceInKilometers = routeDistanceInMeters / 1000;

      } catch (orsError) {
        console.warn("ORS route failed, falling back to OSRM...", orsError);

        // Fallback to OSRM
        const osrmCoords = coordinates.map(c => `${c[0]},${c[1]}`).join(';');
        const osrmResponse = await axios.get(
          `https://router.project-osrm.org/route/v1/driving/${osrmCoords}?geometries=geojson&overview=full`
        );

        const routeData = osrmResponse.data.routes?.[0];
        if (!routeData) throw new Error("No route found via OSRM");

        routeCoords = routeData.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
        routeDistanceInKilometers = (routeData.distance || 0) / 1000;
      }

      setRoute(routeCoords);
      setDistance(routeDistanceInKilometers.toFixed(2));
      console.log("Successfully mapped route!");
    } catch (error) {
      console.error("Error fetching route via both services:", error);
      alert("Could not fetch a driving route to these remote locations. They might be unpaved or not connected.");
    }
  };

  useEffect(() => {
    if (destinations.length < 2) {
      setRoute([]);
      setDistance(null);
    } else {
      getRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinations]);

  // Drag-and-drop handling
  const handleDragEnd = (result: any) => {
    // Reordering currently only affects local UI array sorting if derived state were used.
    // For now, dragging is disabled as it conflicts with backend true state without custom ID tracking.
    // Future update could include order saving in Model.
    console.log("Drag end ignored to sync with DB state correctly", result);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Your Travel Bucket List</h2>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition"
        >
          🔙 Back
        </button>
        <button
          onClick={handleAddDestination}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          ➕ Add Destination
        </button>
      </div>

      {/* Display route distance */}
      {distance && (
        <div className="mb-4 text-center text-lg font-semibold text-blue-600">
          <p>Total Route Distance: {distance} km</p>
        </div>
      )}

      {/* Draggable Destination List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="destinations">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {destinations.map((destination, index) => (
                <Draggable key={index} draggableId={destination.name} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.dragHandleProps}
                      className="p-4 bg-gray-100 rounded-lg shadow-sm flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-semibold text-blue-600">{destination.name}</h3>
                        <p className="text-sm text-gray-600">
                          🌡️ {destination.weather?.temp}°C | {destination.weather?.condition}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteDestination(destination._id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                      >
                        ❌
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      {/* Map with Markers & Route */}
      <MapContainer center={[20, 0]} zoom={2} className="h-80 w-full mt-4 rounded">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {destinations.map((destination, index) => (
          <Marker key={index} position={destination.coordinates} icon={customIcon}>
            <Popup>
              <strong>{destination.name}</strong>
              <br />
              🌡️ {destination.weather?.temp}°C | {destination.weather?.condition}
            </Popup>
          </Marker>
        ))}
        {route.length > 0 && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default BucketList;


























