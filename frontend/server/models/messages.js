const mongoose = require("mongoose");
const connection = mongoose.createConnection(process.env.DB);
const messagesSchema = new mongoose.Schema({
  userEmail: String,
  userMessages: [
    {
      _id: false,
      partnerEmail: String,
      messagesHistory: [
        { _id: false, direction: String, messageInfo: String },
      ],
    },
  ],
});

const Messages = connection.model("Messages", messagesSchema);

module.exports = Messages;