import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Login.css"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp > currentTime) {
          navigate("/dashboard");
        } else {
          localStorage.removeItem("token"); 
        }
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/login", { email, password });
      localStorage.setItem("token", res.data.token);
      alert("Login Successful!");
      navigate("/dashboard");
    } catch (err) {
      if (!err.response) {
        setError("Server is down. Please try again later.");
      } else {
        setError(err.response.data.message || "Invalid email or password");
      }
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
          <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
              <button type="submit" disabled={loading} className="login-button">
                {loading ? "Logging in..." : "Login"}
              </button>
              <p className="siwtch-button" onClick={() => navigate("/signup")}>Don't have an account? Register</p>
              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
      </div>
    </div>
    </>
  );
};

export default Login;
