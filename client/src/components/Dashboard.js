import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp > currentTime) {
        setUser(decoded);

        axios
          .get("http://localhost:5000/dashboard", {
            headers: { Authorization: token },
          })
          .then((res) => console.log(res.data))
          .catch(() => {
            localStorage.removeItem("token");
            navigate("/login");
          });
      } else {
        localStorage.removeItem("token"); 
        navigate("/login");
      }
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
    <h2>Dashboard</h2>
    {user ? (
      <div className="user-info">
        <p>Welcome, <strong>{user.firstName} {user.lastName}</strong>!</p>
        <p>Email: {user.email}</p>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    ) : (
      <p className="loading-message">Loading...</p>
    )}
  </div>
  
  );
};

export default Dashboard;
