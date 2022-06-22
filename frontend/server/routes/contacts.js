const router = require("express").Router();
const userNameByEmail = require("../models/userNameByEmail");
const friendRequests = require("../models/friendRequest");
const { Contacts } = require("../models/contacts");

// function to remove the user from the friend requests list
async function removeUserFromFriendRequests(userEmail, friendEmail) {
  await friendRequests.updateOne(
    { userEmail: userEmail },
    { $pull: { friendRequests: friendEmail } }
  );
  return await friendRequests
    .findOne({ userEmail: userEmail })
    .then(function (user) {
      return user.friendRequests;
    })
    .catch(function (err) {
      console.log(err);
      return err;
    });
}

// GET request to get all friend requests of the user.
router.get("/requests/:userEmail", async (req, res) => {
  const userEmail = req.params.userEmail;
  var query = await friendRequests
    .find({ userEmail: userEmail })
    .select("friendRequests");
  res.send(query);
});

// post request to reject or to accept friend request.
router.post("/requests/answer", async (req, res) => {
  var userEmail = req.body.userEmail;
  var friendRequestEmail = req.body.friendRequestEmail;
  var answer = req.body.answer;
  if (answer == "accept") {
    const friendRequestName = await userNameByEmail(friendRequestEmail);
    const userName = await userNameByEmail(userEmail);

    Contacts.findOneAndUpdate(
      { userEmail: userEmail },
      {
        $push: {
          contacts: {
            name: friendRequestName,
            email: friendRequestEmail,
            newMessage: false,
          },
        },
      },
      { upsert: true, new: true },
      function (error, userDetails) {
        if (!userDetails) res.send(error);
      }
    );
    Contacts.findOneAndUpdate(
      { userEmail: friendRequestEmail },
      {
        $push: {
          contacts: { name: userName, email: userEmail, newMessage: false },
        },
      },
      { upsert: true, new: true },
      function (error, userDetails) {
        if (!userDetails) res.send(error);
      }
    );
  }
  updatedFriendRequestList = await removeUserFromFriendRequests(
    userEmail,
    friendRequestEmail
  );
  res.send(updatedFriendRequestList);
});

// post request to add new contact to the user contacts list
router.post("/:userEmail", async (req, res) => {
  const userEmail = req.params.userEmail;
  const contactEmail = req.body.email;
  const contactName = await userNameByEmail(contactEmail);
  var userContacts = await Contacts.findOne({
    userEmail: userEmail,
  })
    .select("contacts")
    .then((data) => {
      if (data !== null) return data.contacts;
      else return null;
    });
  let isContactExist = false;
  // Check if the contact is already a contact
  if (userContacts !== null) {
    userContacts.forEach((contact) => {
      if (contact.email == contactEmail) isContactExist = true;
    });
  }
  if (isContactExist) {
    res
      .status(405)
      .send({ message: "The user is already on the contacts list" });
  } else if (contactName == null) {
    res.status(404).send({ message: "User is not exist" });
  } else if (userEmail == contactEmail) {
    res.status(409).send({ message: "Can't add yourself" });
  } else {
    friendRequests.findOneAndUpdate(
      { userEmail: contactEmail },
      {
        $push: {
          friendRequests: userEmail,
        },
      },
      { upsert: true, new: true },
      function (error, userDetails) {
        if (!userDetails) res.send(error);
      }
    );
  }
});

router.get("/:userEmail", async (req, res) => {
  const userEmail = req.params.userEmail;
  var query = await Contacts.find({ userEmail: userEmail }).select("contacts");
  res.send(query);
});

// change newMessage to false for all contacts of the user
router.post("/:userEmail/read", async (req, res) => {
  const userEmail = req.params.userEmail;
  Contacts.findOneAndUpdate(
    { userEmail: userEmail },
    { $set: { "contacts.$.newMessage": false } },
    { new: true },
    function (error, userDetails) {
      if (!userDetails) res.send(error);
    }
  );
  var query = await Contacts.find({ userEmail: userEmail }).select("contacts");
  res.send(query);
});

// Change contactEmail newMessage to true or false for the user
function changeNewMessageStatus(userEmail, contactEmail, newMessage) {
  Contacts.findOneAndUpdate(
    { userEmail: userEmail, "contacts.email": contactEmail },
    { $set: { "contacts.$.newMessage": newMessage } },
    { new: true },
    function (error, userDetails) {}
  );
}

// GET request to change newMessage status to false
router.get("/read/:userEmail/:contactEmail/", async (req, res) => {
  const userEmail = req.params.userEmail;
  const contactEmail = req.params.contactEmail;
  changeNewMessageStatus(userEmail, contactEmail, false);
  // response with new contact list
  var query = await Contacts.find({ userEmail: userEmail }).select("contacts");
  res.send(query);
});

router.post("/remove/:userEmail", async (req, res) => {
  const userEmail = req.params.userEmail;
  const contactEmail = req.body.contactEmail;
  await Contacts.updateOne(
    { userEmail: userEmail },
    { $pull: { contacts: { email: contactEmail } } }
  ).then(async function () {
    await Contacts.updateOne(
      { userEmail: contactEmail },
      { $pull: { contacts: { email: userEmail } } }
    )
      .then(function (user) {
        res.sendStatus(200);
      })
      .catch(function (err) {
        res.send(err);
      });
  });
});

module.exports = router;
