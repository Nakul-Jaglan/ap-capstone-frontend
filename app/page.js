"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function App() {
  const [view, setView] = useState("login");
  const [form, setForm] = useState({ username: "", name: "", email: "", password: "" });
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setView("users");
      fetchUsers();
    }
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          name: form.name,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Signup successful! Please login.");
        setForm({ username: "", name: "", email: "", password: "" });
        setTimeout(() => setView("login"), 2000);
      } else {
        setMessage(data.message || "Signup failed");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage("Login successful!");
        setForm({ username: "", name: "", email: "", password: "" });
        setView("users");
        fetchUsers();
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(data.data || []);
      } else {
        setMessage("Failed to fetch users");
        if (res.status === 401) {
          handleLogout();
        }
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUsers([]);
    setView("login");
    setMessage("");
    setForm({ username: "", name: "", email: "", password: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">CollabSpace Auth</h1>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${
            message.includes("successful") 
              ? "bg-green-100 text-green-700 border border-green-300" 
              : "bg-red-100 text-red-700 border border-red-300"
          }`}>
            {message}
          </div>
        )}

        {view === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Create Account</h2>
            
            <input
              name="username"
              placeholder="Username *"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              name="email"
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              name="name"
              placeholder="Full Name (optional)"
              value={form.name}
              onChange={handleChange}
              className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password *"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Creating..." : "Signup"}
            </button>
            
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <span 
                className="text-blue-600 cursor-pointer underline hover:text-blue-800" 
                onClick={() => setView("login")}
              >
                Login
              </span>
            </p>
          </form>
        )}

        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Login</h2>
            
            <input
              name="email"
              placeholder="Email or Username"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <span 
                className="text-blue-600 cursor-pointer underline hover:text-blue-800" 
                onClick={() => setView("signup")}
              >
                Signup
              </span>
            </p>
          </form>
        )}

        {view === "users" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-gray-700">Users List</h2>
            
            <button 
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium" 
              onClick={handleLogout}
            >
              Logout
            </button>
            
            {users.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No users found.</p>
            ) : (
              <ul className="space-y-3 mt-4">
                {users.map((u) => (
                  <li 
                    key={u.id} 
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-gray-800">{u.username}</div>
                    {u.name && <div className="text-sm text-gray-600">({u.name})</div>}
                    <div className="text-sm text-gray-500 mt-1">{u.email}</div>
                    <div className="text-xs text-blue-600 mt-1">Role: {u.role}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}