const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const SUBJECT = db.subject;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'manishdevelopmenttest@gmail.com',
    pass: 'feqwbyndlbkoqtry'
  }
});

var mailOptions = {
  from: 'Academic ERP System',
  to: '',
  subject: 'Subject Assign Infomartion',
  text: ''
};

exports.emailTest = (req, res) => {
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      res.status(500).send({ message: err });
    } else {
      res.send({ message: "Email Sent", data: info.response });
    }
  });
}

exports.signup = (req, res) => {
  if (!req.body.fullName) {
    res.status(422).send({ success: false, message: "user full name is requied." });
    return
  }

  if (!req.body.email) {
    res.status(422).send({ success: false, message: "user email is requied." });
    return
  }

  if (!req.body.password) {
    res.status(422).send({ success: false, message: "user password is requied." });
    return
  }

  const user = new User({
    fullName: req.body.fullName,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ success: false, message: err });
      return;
    }
    Role.findOne({ name: "user" }, (err, role) => {
      if (err) {
        res.status(500).send({ success: false, message: err });
        return;
      }

      user.role = role._id;
      user.save(err => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        res.send({ success: true, message: "registeration successfully!", data: user });
      });
    });
  });
};

exports.signin = (req, res) => {

  if (!req.body.email) {
    res.status(422).send({ success: false, message: "user email is requied." });
    return
  }

  if (!req.body.password) {
    res.status(422).send({ success: false, message: "user password is requied." });
    return
  }
  var password = req.body.password;
  User.aggregate([
    {
      $lookup:
      {
        from: 'roles',
        localField: 'role',
        foreignField: '_id',
        as: 'role'
      }
    },
    {
      $match: {
        email: req.body.email
      }
    }
  ], function (err, user) {
    if (err) {
      res.status(500).send({ success: false, message: err });
      return;
    }

    if (!user.length) {
      return res.status(404).send({ success: false, message: "User Not found." });
    }

    var passwordIsValid = bcrypt.compareSync(
      password,
      user[0].password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        success: false,
        message: "Invalid Password!"
      });
    }

    var token = jwt.sign({ id: user[0]?._id, roleName: user[0]?.role[0]?.name }, config.secret, {
      expiresIn: "2h" // 24 hours
    });

    res.status(200).send({
      success: true,
      message: "user login successfully",
      data: {user,token}
    });
  });
};
