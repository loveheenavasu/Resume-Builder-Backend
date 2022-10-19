const { dirname } = require('path');
const db = require("../models");
const User = db.user;

// GET USERS ONLY User.
exports.getAll = (req, res) => {
  let roleFilter = req?.userRole == "user" ? { $expr: { $eq: ['$_id', { $toObjectId: req.userId }] } } :
    { $expr: { $not: { $eq: ['$_id', { $toObjectId: req?.userId }] } } };

  User.aggregate([
    {
      $lookup: {
        from: 'roles',
        localField: 'role',
        foreignField: '_id',
        as: 'role'
      }
    },
    { $match: roleFilter }
  ], function (err, users) {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (users.length) {
      res.send({
        success: true,
        message: "Users found successfully.",
        data: users
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Users not found.",
        data: users
      });
    }
  });
};

exports.getSingle = (req, res) => {
  if (!req.params.id) {
    res.status(422).send({ success: false, message: "user id is requied." });
    return
  }

  User.aggregate([
    {
      $lookup: {
        from: 'roles',
        localField: 'role',
        foreignField: '_id',
        as: 'role'
      }
    },
    { $match: { $expr: { $eq: ['$_id', { $toObjectId: req.params.id }] } } }
  ], function (err, users) {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (users.length) {
      res.send({
        success: true,
        message: "User found successfully.",
        data: users
      });
    } else {
      res.status(404).send({
        success: false,
        message: "User not found.",
        data: users
      });
    }
  });
};

exports.update = (req, res) => {

  if (req.params.id != req.userId) {
    res.status(422).send({ success: false, message: "You don't have permission." });
    return;
  }

  if (req?.files?.image) {
    let image = req?.files?.image;
    let imagename = req.params.id + '.' + image.name.split('.').pop();
    let path = dirname(dirname(__dirname)) + '/public/images/' + imagename;
    image.mv(path);
    req.body.image = '/public/images/' + imagename;
  } else {
    if (req?.body?.image) {
      delete req?.body?.image
    }
    if (!req.params.id) {
      res.status(422).send({ success: false, message: "user id is requied." });
      return;
    }
    if (req?.body?.password) {
      delete req?.body?.password
    }
  }

  User.updateOne({ _id: req.params.id }, { $set: req.body }, function (err, user) {
    if (err) {
      res.status(500).send({ success: false, message: err });
      return;
    }
    if (user.nModified) {
      User.aggregate([
        {
          $lookup: {
            from: 'roles',
            localField: 'role',
            foreignField: '_id',
            as: 'role'
          }
        },
        { $match: { $expr: { $eq: ['$_id', { $toObjectId: req.params.id }] } } }
      ], function (err, user) {
        // if (err) {
        //   res.status(500).send({ message: err });
        //   return;
        // }
        res.send({
          success: true,
          message: "Profile update successfully.",
          data: user
        });
        return;
      })
    } else {
      res.status(400).send({
        success: true,
        message: "Profile update unsuccessful."
      });
      return;
    }
  });
};

exports.delete = (req, res) => {
  User.deleteOne({ _id: req.params.id }, function (err, user) {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (user.deletedCount == 1 && user.ok == 1) {
      res.send({
        message: "User delete successfully."
      });
    } else if (user.deletedCount == 0 && user.ok == 1) {
      res.status(404).send({
        message: "User not found."
      });
    } else {
      res.status(400).send({
        message: "User delete unsuccessful."
      });
    }
  });
};