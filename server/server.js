const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const users = [
  {
    firstName: "Prince",
    lastName: "Maurya",
    country: "India",
    city: "Mumbai",
    contactNumber: 9987742369,
    email: "princemaurya8879@gmail.com",
    password: bcrypt.hashSync("123", 10), 
  },
]; 

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal Server Error. Please try again later." });
});

app.post("/signup", async (req, res) => {
  const { firstName, lastName, country, city, contactNumber, email, password } = req.body;

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ firstName, lastName, country, city, contactNumber, email, password: hashedPassword });
  res.json({ message: "User registered successfully" });
  console.log(users);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
    "secretKey",
    { expiresIn: "1d" }
  );
  res.json({ token, user: { firstName: user.firstName, lastName: user.lastName, email: user.email } });
});


app.get("/dashboard", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    res.json({ message: "Welcome to Dashboard", user: decoded });
    console.log(decoded);
    console.log("Token : ", token);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
