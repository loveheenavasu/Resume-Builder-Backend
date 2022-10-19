const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      image: String,
      fullName: String,
      email: String,
      password: String,
      phone: String,
      address: String,
      summary: String,
      experiences:{},
      educations:{},
      interestsHobbies:{},
      skills:{},
      role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "roles"
      }
    },
    {
      timestamps: true
    }
  )
);

module.exports = User;
