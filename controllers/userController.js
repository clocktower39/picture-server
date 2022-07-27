const User = require("../models/user");

const signup_user = (req, res) => {
  let user = new User(req.body);
  let saveUser = () => {
    user.save((err) => {
      if (err) {
        res.send({ error: { err } });
      } else {
        res.send({
          status: "success",
          user,
        });
      }
    });
  };
  saveUser();
};

const list_users = (req, res) => {
  User.
  find({}).
  exec(function (err, users) {
    if(err) res.send(err)
    res.json(users)
  })
}

module.exports = {
  signup_user,
  list_users,
};