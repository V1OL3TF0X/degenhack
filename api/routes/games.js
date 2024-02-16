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

router.delete("/:id", (req, res, next) => {
    Game.deleteOne({ _id: req.params.id })
      .then(result => {
        console.log(result);
        if (result.deletedCount > 0) {
          res.status(200).json({ message: `Game with id ${req.params.id} deleted`});
        } else {
          res.status(404).json({ message: `Game with id ${req.params.id} not found` });
        }
      })
      .catch(error => {
        res.status(400).json({
          message: `Error deleting game with id ${req.params.id}`,
          error: error
        });
      });
});

router.get("", (req, res, next) => {
    const gamesQuery = Game.find();

    gamesQuery.then(games => {
        res.status(200).json({
            message: "Games fetched successfully",
            games: games,
        });
      })
      .catch(error => {
        res.status(400).json({
          message: "Fetching games failed",
          error: error
        });
      });
});

router.get("/:id", (req, res, next) => {
    Game.findById(req.params.id)
      .then(game => {
        if (game) {
          res.status(200).json(game);
        } else {
          res.status(404).json({ message: `Game with id ${req.params.id} not found` });
        }
      })
      .catch(error => {
        res.status(400).json({
          message: "Fetching game failed",
          error: error
        });
      });
});   

module.exports = router;