const { User } = require("./user");

var userNameByEmail = async (userEmail) => {
  var query = await User.find({ email: userEmail });
  if (query.length == 0 ) return null;
  else return `${query[0].firstName} ${query[0].lastName}`;
};

module.exports = userNameByEmail;
