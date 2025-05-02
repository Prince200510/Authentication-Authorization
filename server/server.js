// server.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

app.post("/admin/add", async (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { firstName, lastName, country, city, contactNumber, email, password } = req.body;
    const adminsFilePath = path.join(__dirname, 'data', 'admins.json');
    
    const adminsData = JSON.parse(fs.readFileSync(adminsFilePath, 'utf8'));
    
    if (adminsData.admins.some(admin => admin.email === email)) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = {
      firstName,
      lastName,
      country,
      city,
      contactNumber,
      email,
      password: hashedPassword,
      role: "admin"
    };

    adminsData.admins.push(newAdmin);
    fs.writeFileSync(adminsFilePath, JSON.stringify(adminsData, null, 2));
    
    res.json({ message: "Admin added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding admin" });
  }
});

app.get("/admin/list", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const adminsFilePath = path.join(__dirname, 'data', 'admins.json');
    const adminsData = JSON.parse(fs.readFileSync(adminsFilePath, 'utf8'));
    
    const safeAdminList = adminsData.admins.map(({ password, ...admin }) => admin);
    res.json(safeAdminList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin list" });
  }
});

app.delete("/admin/delete/:email", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const adminEmail = req.params.email;
    const adminsFilePath = path.join(__dirname, 'data', 'admins.json');
    const adminsData = JSON.parse(fs.readFileSync(adminsFilePath, 'utf8'));
    
    if (adminsData.admins.length === 1) {
      return res.status(400).json({ message: "Cannot delete the last admin" });
    }

    if (adminEmail === decoded.email) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const filteredAdmins = adminsData.admins.filter(admin => admin.email !== adminEmail);
    
    if (filteredAdmins.length === adminsData.admins.length) {
      return res.status(404).json({ message: "Admin not found" });
    }

    adminsData.admins = filteredAdmins;
    fs.writeFileSync(adminsFilePath, JSON.stringify(adminsData, null, 2));
    
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting admin" });
  }
});

// const users = [
//   {
//     firstName: "Prince",
//     lastName: "Maurya",
//     country: "India",
//     city: "Mumbai",
//     contactNumber: 9987742369,
//     email: "princemaurya8879@gmail.com",
//     password: bcrypt.hashSync("123", 10),
//     role: "admin", 
//   },
//   {
//     firstName: "Aaryan",
//     lastName: "Korida",
//     country: "India",
//     city: "Mumbai",
//     contactNumber: 9987742369,
//     email: "aaryan@gmail.com",
//     password: bcrypt.hashSync("123", 10),
//     role: "user", 
//   },
// ];

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Remove this entire signup route
// app.post("/signup", async (req, res) => {
//   const { firstName, lastName, country, city, contactNumber, email, password, role } = req.body;
//   if (users.find((u) => u.email === email)) {
//     return res.status(400).json({ message: "User already exists" });
//   }
//   const hashedPassword = await bcrypt.hash(password, 10);
//   users.push({ firstName, lastName, country, city, contactNumber, email, password: hashedPassword, role });
//   res.json({ message: "User registered successfully" });
// });

// Keep only this signup route that uses JSON file
app.post("/signup", async (req, res) => {
  const { firstName, lastName, country, city, contactNumber, email, password } = req.body;

  const usersFilePath = path.join(__dirname, 'data', 'users.json');
  const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));

  if (usersData.users.some(u => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    firstName,
    lastName,
    country,
    city,
    contactNumber,
    email,
    password: hashedPassword,
    role: "user"
  };

  usersData.users.push(newUser);
  fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
  
  res.json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const adminsFilePath = path.join(__dirname, 'data', 'admins.json');
    const adminsData = JSON.parse(fs.readFileSync(adminsFilePath, 'utf8'));
    
    const admin = adminsData.admins.find(a => a.email === email);
    if (admin) {
      
      if (email === "princemaurya8879@gmail.com" && password === "123") {
        const token = jwt.sign(
          {
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            role: admin.role,
            country: admin.country,
            city: admin.city,
            contactNumber: admin.contactNumber
          },
          "secretKey",
          { expiresIn: "1d" }
        );
        return res.json({ token, role: admin.role });
      }
      
      const isMatch = await bcrypt.compare(password, admin.password);
      if (isMatch) {
        const token = jwt.sign(
          {
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            role: admin.role,
            country: admin.country,
            city: admin.city,
            contactNumber: admin.contactNumber
          },
          "secretKey",
          { expiresIn: "1d" }
        );
        return res.json({ token, role: admin.role });
      }
    }

    const usersFilePath = path.join(__dirname, 'data', 'users.json');
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    
    const user = usersData.users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        country: user.country,
        city: user.city,
        contactNumber: user.contactNumber
      },
      "secretKey",
      { expiresIn: "1d" }
    );
    res.json({ token, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error during login" });
  }
});

app.get("/dashboard", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    const response = {
      message: "Welcome to Dashboard",
      user: decoded,
      isAdmin: decoded.role === "admin"
    };
    res.json(response);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));

app.get("/users/list", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const usersFilePath = path.join(__dirname, 'data', 'users.json');
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  
    const safeUserList = usersData.users.map(({ password, ...user }) => user);
    res.json(safeUserList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user list" });
  }
});

app.delete("/users/delete/:email", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const userEmail = req.params.email;
    const usersFilePath = path.join(__dirname, 'data', 'users.json');
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));

    const filteredUsers = usersData.users.filter(user => user.email !== userEmail);
    
    if (filteredUsers.length === usersData.users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    usersData.users = filteredUsers;
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

 

app.get("/user/:email", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    const userEmail = req.params.email;

    const usersFilePath = path.join(__dirname, 'data', 'users.json');
    const adminsFilePath = path.join(__dirname, 'data', 'admins.json');
    
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    const adminsData = JSON.parse(fs.readFileSync(adminsFilePath, 'utf8'));
    
    const user = usersData.users.find(u => u.email === userEmail) || 
                adminsData.admins.find(a => a.email === userEmail);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...safeUserData } = user;
    res.json(safeUserData);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Error fetching user details" });
  }
});
