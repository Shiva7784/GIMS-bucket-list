import React, { useState, useEffect } from 'react';
import { User, X, LogOut, Check, Edit, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserProfile = ({ onClose }: { onClose: () => void }) => {
  const { user, signIn, signUp, signOut } = useAuth();
  const [showForm, setShowForm] = useState<"login" | "signup" | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "", 
    name: "",
  });
  const [errors, setErrors] = useState({ 
    email: "", 
    password: "", 
    name: "",
    general: ""
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "", name: "", general: "" };

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    if (showForm === "signup" && formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      valid = false;
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "", general: "" }));
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await signIn(formData.email, formData.password);
      setShowForm(null);
      setSuccessMsg("Login successful!");
    } catch (error) {
      setErrors(prev => ({ ...prev, general: "Invalid email or password" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await signUp(formData.email, formData.password);
      setShowForm(null);
      setSuccessMsg("Account created successfully! Please check your email.");
    } catch (error) {
      setErrors(prev => ({ ...prev, general: "Signup failed. Please try again." }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setSuccessMsg("Logged out successfully!");
    } catch (error) {
      setErrors(prev => ({ ...prev, general: "Logout failed" }));
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {user ? 'Profile' : (showForm === "signup" ? 'Create Account' : 'Sign In')}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{user.email}</h3>
                  <p className="text-gray-500 text-sm">Signed in</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {showForm && (
                <>
                  {showForm === "signup" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg"
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  {errors.general && (
                    <p className="text-red-600 text-sm text-center">{errors.general}</p>
                  )}

                  <button
                    onClick={showForm === "signup" ? handleSignup : handleLogin}
                    disabled={isLoading}
                    className={`w-full py-2 rounded-lg transition-colors ${
                      isLoading 
                        ? "bg-blue-400 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white`}
                  >
                    {isLoading 
                      ? "Processing..." 
                      : (showForm === "signup" ? "Create Account" : "Sign In")
                    }
                  </button>

                  <p className="text-center text-gray-600">
                    {showForm === "signup" 
                      ? "Already have an account? "
                      : "Don't have an account? "
                    }
                    <button
                      onClick={() => {
                        setShowForm(showForm === "signup" ? "login" : "signup");
                        setErrors({ email: "", password: "", name: "", general: "" });
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      {showForm === "signup" ? "Sign In" : "Sign Up"}
                    </button>
                  </p>
                </>
              )}

              {!showForm && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowForm("login")}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowForm("signup")}
                    className="w-full py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mt-4 p-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
              <Check className="w-5 h-5" />
              {successMsg}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;