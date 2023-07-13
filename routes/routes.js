const express = require("express");
const routes = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require('fs')

var stroage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

const uploads = multer({
  storage: stroage,
}).single("image");

routes.post("/add", uploads, async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
    });

    await user.save();
    req.session.message = {
      type: "success",
      message: "User added successfully",
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

routes.get("/", async (req, res) => {
  try {
    const users = await User.find().exec();
    res.render("index", {
      title: "home",
      users: users,
    });
  } catch (err) {
    res.json({ message: err.message });
  }
});

routes.get("/add", (req, res) => {
  res.render("add-user", { title: "add user" });
});
// edit an user
routes.get("/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).exec();

    if (user === null) {
      res.redirect("/");
    } else {
      res.render("edit-user", {
        title: "edit user",
        user: user,
      });
    }
  } catch (err) {
    res.redirect("/");
  }
});

routes.post("/update/:id", uploads, async (req, res) => {
  try {
    const id = req.params.id;
    let new_image = "";
    if (req.file) {
      new_image = req.file.filename;
    } else {
      new_image = req.body.old_image;
    }

    await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image,
    });

    req.session.message = {
      type: "success",
      message: "User updated successfully",
    };
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

routes.get("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).exec();

    if (user.image !== '') {
      fs.unlinkSync('./uploads/' + user.image);
    }

    await User.findByIdAndDelete(id).exec();

    req.session.message = {
      type: "success",
      message: "User deleted successfully",
    };
  } catch (err) {
    console.log(err);
  }

  res.redirect("/");
});
module.exports = routes;
