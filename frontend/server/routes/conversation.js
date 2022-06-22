const router = require("express").Router();
const Messages = require("../models/messages");

// return message history by user name and user id using get request
router.get("/:userEmail/:reciverEmail", async (req, res) => {
  var userEmail = req.params.userEmail;
  var reciverEmail = req.params.reciverEmail;
  var query = await Messages.find({
    userEmail: userEmail,
    userMessages: { $elemMatch: { partnerEmail: reciverEmail } },
  })
  res.send(query);
});

module.exports = router;
