const express = require("express");
const Game = require("../model/game");

const router = express.Router();

router.post("", (req, res, next) => {
    const game = new Game({
      name: req.body.name
    });

    game.save().then(createdGame => {
        res.status(201).json({
          message: "Game added successfully",
          post: {
            id: createdGame._id
          }
        });
      }).catch(error => {
        res.status(400).json({
          message: "Creating a game failed!",
          error: error
        });
      });
  }
);

module.exports = router;