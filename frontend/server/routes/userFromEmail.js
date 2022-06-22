const router = require("express").Router();
const { User } = require("../models/user");

// get request, return the user name by user email
router.get("/:userEmail", async (req, res) => {
  const userEmail = req.params.userEmail;
  var query = await User.find({ email: userEmail});
  res.send(query);
});

module.exports = router;