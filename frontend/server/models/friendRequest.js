const mongoose = require("mongoose");
const connection = mongoose.createConnection(process.env.DB);
const friendRequestsSchema = new mongoose.Schema({
  userEmail: String,
  friendRequests: []  
});

const friendRequests = connection.model("Friend requests", friendRequestsSchema);

module.exports = friendRequests;
