// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://peraambigaidhevi_db_user:M9z2v0rWwmeGhfut@productivity-tracker.e6ojfio.mongodb.net/productivity-tracker")
  .then(() => console.log("MongoDB Atlas connected!"))
  .catch(err => console.log("Connection error:", err));
//mongodb+srv://peraambigaidhevi_db_user:M9z2v0rWwmeGhfut@productivity-tracker.e6ojfio.mongodb.net/

// Schema for activity
const activitySchema = new mongoose.Schema({
  url: String,
  duration_seconds: Number,
  timestamp: String
});

const Activity = mongoose.model("Activity", activitySchema);

// Receive data from Chrome extension
app.post("/activity", async (req, res) => {
  try{
  const activity = new Activity(req.body);
  await activity.save();
  res.json({ status: "saved" });
  }catch(err){
    res.send(500).json({error: err.message})
  }
});

// Send today's stats to dashboard
app.get("/stats/today", async (req, res) => {
  try{
  const today = new Date().toISOString().split("T")[0];
  const results = await Activity.aggregate([
    { $match: { timestamp: { $regex: today } } },
    { $group: { _id: "$url", total: { $sum: "$duration_seconds" } } },
    { $sort: { total: -1 } }
  ]);
  res.json(results);
}catch(err){
  res.status(500).json({error:err.message})
}
});

app.listen(8000, () => console.log("Server running on port 8000"));