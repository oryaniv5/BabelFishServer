const Messages = require("../models/messages");
const { User } = require("../models/user");
const {changeNewMessageStatus} = require("../models/contacts");

// get user lang by user Email
async function userEmailToLang(userEmail) {
  return await User.findOne({ email: userEmail })
    .then(function (user) {
      return  user.language;
    })
    .catch(function (err) {
      console.log(err);
    });
}

module.exports = function (io) {
  async function save(message, sender, reciver, dir) {
    var query1 = await Messages.findOne({ userEmail: sender });
    if (query1 == null) {
      await Messages.create({
        userEmail: sender,
        userMessages: {
          partnerEmail: reciver,
          messagesHistory: [
            {
              direction: dir,
              messageInfo: message,
            },
          ],
        },
      });
      return;
    }
    var query2 = await Messages.findOne({
      userEmail: sender,
      "userMessages.partnerEmail": reciver,
    });

    if (query2 == null) {
      await Messages.findOneAndUpdate(
        { userEmail: sender },
        {
          $push: {
            userMessages: {
              partnerEmail: reciver,
              messagesHistory: [
                {
                  direction: dir,
                  messageInfo: message,
                },
              ],
            },
          },
        },
        { upsert: true, new: true }
      );
      return;
    }

    await Messages.findOneAndUpdate(
      {
        userEmail: sender,
        userMessages: { $elemMatch: { partnerEmail: reciver } },
      },
      {
        $push: {
          "userMessages.$.messagesHistory": {
            direction: dir,
            messageInfo: message,
          },
        },
      },
      { upsert: true, new: true }
    );
  }

  var userNameToIdMap = {};
  const spawn = require("child_process").spawn;

  // Chat API
  io.on("connection", (socket) => {
    // get message deatil from user, add it the message history and send to reciver.
    socket.on("send-message", async (message, sender, reciver) => {
      // save the messsage for the sender
      save(message, sender, reciver, 'out');
      var recieverLang = await userEmailToLang(reciver)
      .then(function (lang) {
        return lang;
      });
      const pythonProcess = spawn("python", [
        "server/translate/translate.py",
        message,
        recieverLang,
      ]);
      pythonProcess.stdout.on("data", async (data) => {
        var translateMessage = data.toString()
        socket
        .to(userNameToIdMap[reciver])
        .emit("recive-message", translateMessage, sender);
        changeNewMessageStatus(reciver, sender, true);
        save(translateMessage, reciver, sender, "in");
      });
      pythonProcess.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
      }
      );
    });
    socket.on("choose-user-name", (userEmail) => {
      userNameToIdMap[userEmail] = socket.id;
    });
  });
};
