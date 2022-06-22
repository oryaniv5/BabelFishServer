require("dotenv").config({path:__dirname+'/.env'});

const express = require("express");
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const newContactRoute = require("./routes/contacts")
const conversationRoute = require("./routes/conversation")
const userFromEmail = require("./routes/userFromEmail")
const cors = require('cors');
const spawn = require("child_process").spawn;

const PORT = process.env.PORT || 3001;

const app = express();

// Add cors configatrion
const corsOptions ={
  origin:'http://localhost:3000', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
app.use(cors(corsOptions));

// Add body parser
const bodyParser = require('body-parser');
const { allowedNodeEnvironmentFlags } = require("process");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

// database connection
connection();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/contacts", newContactRoute);
app.use("/messages", conversationRoute);
app.use("/userName", userFromEmail);

// open socket connection, 
// using for chatBox consistent communication
const io = require("socket.io")(3002, {
  cors: {
    // TODO: change to all 
    origin: ['http://localhost:3000', 'http://localhost:3003']
  }
})
require("./routes/chat")(io)

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
