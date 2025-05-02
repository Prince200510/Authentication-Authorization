import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    city: "",
    contactNumber: "",
    role: "user",  
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/signup", formData);
      setSuccess(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }

    setLoading(false);
  };


  return (
    <>
    <div class="parent">
      <div class="image-section">
        <div class="artwork"></div>
      </div>
      <div class="form-section">
      <div className="signup-container">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="sign-up-input">
            <div className="child-sign-up-input">
              <label>First Name</label>
              <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="child-sign-up-input">
              <label>Last Name</label>
              <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div className="sign-up-input">
            <div className="child-sign-up-input">
              <label>Country</label>
              <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
            </div>
            <div className="child-sign-up-input">
              <label>City</label>
              <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
            </div>
          </div>
          <div className="sign-up-input">
            <div className="child-sign-up-input">
              <label>Contact Number</label>
              <input type="tel" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} required />
            </div>
            <div className="child-sign-up-input">
              <label>Password</label>
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            </div>
          </div>
          <div className="child-sign-up-input">
            <label>Email ID</label>
            <input style={{width: "95%"}} type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          </div>
          {/* Remove the role selection dropdown */}
          <button type="submit" disabled={loading} className="signup-button">
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>
        <p className="switch-button">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>
      </div>
    </div>
    </>
  );
};

export default Signup;
