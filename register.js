const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000;

// middleware
app.use(express.json());

// בדיקת שרת
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// הפעלת שרת
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
