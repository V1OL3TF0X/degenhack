const express = require("express");
const User = require("../model/user");

const router = express.Router();

router.post("", (req, res, next) => {
    const avatar = 'eyes6-mouths4-pants6-shirts0-hair4-acc5.png';
    const user = new User({
      publicKey: req.body.publicKey,
      avatarLink: avatar
    });

    user.save().then(createdUser => {
        res.status(201).json({
          message: "User added successfully",
          user: {
            id: createdUser._id,
            avatarLink: avatar
          }
        });
      }).catch(error => {
        res.status(400).json({
          message: "Creating a User failed!",
          error: error
        });
      });
  }
);

router.delete("/:id", (req, res, next) => {
    User.deleteOne({ _id: req.params.id })
      .then(result => {
        console.log(result);
        if (result.deletedCount > 0) {
          res.status(200).json({ message: `User with id ${req.params.id} deleted`});
        } else {
          res.status(404).json({ message: `User with id ${req.params.id} not found` });
        }
      })
      .catch(error => {
        res.status(400).json({
          message: `Error deleting User with id ${req.params.id}`,
          error: error
        });
      });
});

router.get("", (req, res, next) => {
    const usersQuery = User.find();

    usersQuery.then(users => {
        res.status(200).json({
            message: "Users fetched successfully",
            users: users,
        });
      })
      .catch(error => {
        res.status(400).json({
          message: "Fetching Users failed",
          error: error
        });
      });
});

router.get("/:id", (req, res, next) => {
    User.findById(req.params.id)
      .then(User => {
        if (User) {
          res.status(200).json(User);
        } else {
          res.status(404).json({ message: `User with id ${req.params.id} not found` });
        }
      })
      .catch(error => {
        res.status(400).json({
          message: "Fetching User failed",
          error: error
        });
      });
});

router.get("/publickey/:pubkey", (req, res, next) => {
  User.findOne({ publicKey: req.params.pubkey })
    .then(User => {
      if (User) {
        res.status(200).json(User);
      } else {
        res.status(404).json({ message: `User with public key ${req.params.pubkey} not found` });
      }
    })
    .catch(error => {
      res.status(400).json({
        message: "Fetching User failed",
        error: error
      });
    });
}); 

module.exports = router;