import React, { useState } from "react";
import { DataProvider } from "./context/DataContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import BucketList from "./components/BucketList";
import VirtualTour from "./components/VirtualTour";
import GlobeSpinner from "./components/GlobeSpinner";
import MoodExplorer from "./components/MoodExplorer";
import ErrorBoundary from "./components/ErrorBoundary";
import UserProfile from "./components/UserProfile";
import SearchBar from "./components/SearchBar";

const Home = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="text-center py-12 px-4"
  >
    <motion.h1
      className="text-4xl md:text-5xl font-bold text-gray-800 mb-6"
      initial={{ y: -20 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.1 }}
    >
      Welcome to Your <span className="text-blue-600">Travel Bucket List</span>
    </motion.h1>
    <motion.p
      className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      Discover, plan, and fulfill your dream destinations around the world.
    </motion.p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
      {[
        {
          path: "/bucket-list",
          label: "View Bucket List",
          icon: "📌",
          color: "from-blue-500 to-blue-600",
          hover: "hover:from-blue-600 hover:to-blue-700"
        },
        {
          path: "/globe-spinner",
          label: "Spin the Globe",
          icon: "🌍",
          color: "from-green-500 to-green-600",
          hover: "hover:from-green-600 hover:to-green-700"
        },
        {
          path: "/mood-explorer",
          label: "Mood Explorer",
          icon: "😊",
          color: "from-yellow-500 to-yellow-600",
          hover: "hover:from-yellow-600 hover:to-yellow-700"
        },
        {
          path: "/virtual-tour",
          label: "Virtual Tour",
          icon: "🎥",
          color: "from-purple-500 to-purple-600",
          hover: "hover:from-purple-600 hover:to-purple-700"
        },
      ].map((item, index) => (
        <motion.div
          key={item.path}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            to={item.path}
            className={`block p-6 rounded-xl bg-gradient-to-br ${item.color} ${item.hover} text-white shadow-lg transition-all duration-300 transform hover:shadow-xl`}
          >
            <span className="text-3xl block mb-3">{item.icon}</span>
            <span className="text-xl font-semibold">{item.label}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const AppContent = () => {
  const [showUserProfile, setShowUserProfile] = useState(false);
  const navigate = useNavigate();

  const handleAddDestination = (destination: any) => {
    console.log("Added destination:", destination);
  };

  const handleFlyTo = (coords: { lat: number; lng: number }) => {
    console.log("Flying to coordinates:", coords);
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  const handleNavigateFromSearch = (page: string | null) => {
    if (!page) return;
    const pathMap: Record<string, string> = {
      bucketList: "/bucket-list",
      globeSpinner: "/globe-spinner",
      moodExplorer: "/mood-explorer",
      virtualTour: "/virtual-tour",
    };
    navigate(pathMap[page] || "/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header
        onNavigate={handleNavigateFromSearch}
        className="shadow-sm"
      />

      <AnimatePresence>
        {showUserProfile && (
          <UserProfile
            onClose={() => setShowUserProfile(false)}
          />
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 pt-4 pb-8">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/bucket-list" element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BucketList />
            </motion.div>
          } />

          <Route path="/virtual-tour" element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <VirtualTour />
            </motion.div>
          } />

          <Route path="/globe-spinner" element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <GlobeSpinner />
            </motion.div>
          } />

          <Route path="/mood-explorer" element={
            <ErrorBoundary
              fallback={
                <div className="p-6 bg-red-50 text-red-600 rounded-xl shadow-inner">
                  Failed to load Mood Explorer
                </div>
              }
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MoodExplorer
                  onClose={() => handleNavigateFromSearch('bucketList')}
                  onAddDestination={handleAddDestination}
                  onFlyTo={handleFlyTo}
                />
              </motion.div>
            </ErrorBoundary>
          } />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <DataProvider>
    <Router>
      <AppContent />
    </Router>
  </DataProvider>
);

export default App;