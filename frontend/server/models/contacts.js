const mongoose = require("mongoose");
const connection = mongoose.createConnection(process.env.DB);
const ContactsSchema = new mongoose.Schema({
  userEmail: String,
  contacts: [],
});
const Contacts = connection.model("Contacts", ContactsSchema);

// Change contactEmail new_message to true for the user
function changeNewMessageStatus(userEmail, contactEmail) {
  console.log("changeNewMessageStatus");
  Contacts.findOneAndUpdate(
    { userEmail: userEmail, "contacts.email": contactEmail },
    { $set: { "contacts.$.newMessage": true } },
    { new: true },
    function (error, userDetails) {
      if (!userDetails)
        console.log(error);
    }
  );
  console.log("after changeNewMessageStatus");
}

module.exports = {Contacts, changeNewMessageStatus};
