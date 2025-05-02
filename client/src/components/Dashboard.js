import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [adminList, setAdminList] = useState([]);
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    city: "",
    contactNumber: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUserList = async (token) => {
    try {
      const userResponse = await axios.get("http://localhost:5000/users/list", {
        headers: { Authorization: token },
      });
      setUserList(userResponse.data);
    } catch (error) {
      console.error("User list fetch error:", error);
      setMessage("Error fetching user list");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
  
      try {
        const response = await axios.get("http://localhost:5000/dashboard", {
          headers: { Authorization: token },
        });
        
        const userDetailsResponse = await axios.get(
          `http://localhost:5000/user/${response.data.user.email}`,
          { headers: { Authorization: token } }
        );
        
        setUserData({
          ...response.data,
          user: { ...response.data.user, ...userDetailsResponse.data }
        });
  
        if (response.data.user.role === 'admin') {
          fetchAdminList(token);
          fetchUserList(token);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        setMessage("Error loading dashboard");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const fetchAdminList = async (token) => {
    try {
      const adminResponse = await axios.get("http://localhost:5000/admin/list", {
        headers: { Authorization: token },
      });
      setAdminList(adminResponse.data);
      console.log("Admin list:", adminResponse.data);
    } catch (error) {
      console.error("Admin list fetch error:", error);
      setMessage("Error fetching admin list");
    }
  };

  const handleInputChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/admin/add", newAdmin, {
        headers: { Authorization: token },
      });
      setMessage("Admin added successfully");
      fetchAdminList(token);
      setNewAdmin({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        country: "",
        city: "",
        contactNumber: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Error adding admin");
    }
  };

  const handleDeleteAdmin = async (email) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/admin/delete/${email}`, {
        headers: { Authorization: token },
      });
      setMessage("Admin deleted successfully");
      fetchAdminList(token);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error deleting admin");
    }
  };

  const handleDeleteUser = async (email) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/users/delete/${email}`, {
        headers: { Authorization: token },
      });
      setMessage("User deleted successfully");
      fetchUserList(token);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error deleting user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!userData) return <div className="error">Please login to access dashboard</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome, {userData.user.firstName}!</h1>
          <p>Role: {userData.user.role}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      {userData.user.role === 'admin' ? (
        <div className="admin-section">
          <h2>Admin Management</h2>
          
          <form onSubmit={handleAddAdmin} className="admin-form">
            <h3>Add New Admin</h3>
            <div className="form-row">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={newAdmin.firstName}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={newAdmin.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newAdmin.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={newAdmin.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={newAdmin.country}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={newAdmin.city}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="tel"
                name="contactNumber"
                placeholder="Contact Number"
                value={newAdmin.contactNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit">Add Admin</button>
          </form>

          <div className="admin-list">
            <h3>Current Admins</h3>
            <div className="admin-cards">
              {adminList.map((admin) => (
                <div key={admin.email} className="admin-card">
                  <div className="admin-info">
                    <h4>{admin.firstName} {admin.lastName}</h4>
                    <p>{admin.email}</p>
                    <p>{admin.country}, {admin.city}</p>
                    <p>Contact: {admin.contactNumber}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAdmin(admin.email)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="users-section">
            <h2>User Management</h2>
            <div className="user-cards">
              {userList.map((user) => (
                <div key={user.email} className="user-card">
                  <div className="user-info">
                    <h4>{user.firstName} {user.lastName}</h4>
                    <p>{user.email}</p>
                    <p>{user.country}, {user.city}</p>
                    <p>Contact: {user.contactNumber}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user.email)}
                    className="delete-button"
                  >
                    Delete User
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="user-profile-section">
          <h2>My Profile</h2>
          <div className="user-profile-card">
            <div className="user-avatar">
              {userData.user.firstName.charAt(0)}{userData.user.lastName.charAt(0)}
            </div>
            <div className="user-details">
              <h3>{userData.user.firstName} {userData.user.lastName}</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Email</span>
                  <span className="value">{userData.user.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Location</span>
                  <span className="value">{userData.user.city}, {userData.user.country}</span>
                </div>
                <div className="info-item">
                  <span className="label">Contact</span>
                  <span className="value">{userData.user.contactNumber}</span>
                </div>
                <div className="info-item">
                  <span className="label">Account Type</span>
                  <span className="value">{userData.user.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default Dashboard;
