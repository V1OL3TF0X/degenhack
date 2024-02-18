const express = require("express");
const Game = require("../model/game");
const { createGame, winGame, reimbruiseGame } = require("../utils/blockchain");

const router = express.Router();

router.post("", (req, res, next) => {
  const game = new Game({
    name: req.body.name,
    embeddedUrl: req.body.embeddedUrl,
    minParticipants: req.body.minParticipants,
    maxParticipants: req.body.maxParticipants,
    participants: req.body.participants ? req.body.participants : [],
    prize: req.body.prize,
    betAmount: req.body.betAmount,
  });
  game
    .save()
    .then((createdGame) => {
      res.status(201).json({
        message: "Game added successfully",
        game: {
          id: createdGame._id,
        },
      });
    })
    .catch((error) => {
      res.status(400).json({
        message: "Creating a game failed!",
        error: error,
      });
    });
});

router.delete("/:id", (req, res, next) => {
  Game.deleteOne({ _id: req.params.id })
    .then((result) => {
      console.log(result);
      if (result.deletedCount > 0) {
        reimbruiseGame(req.params.id).then(() => {
          res
            .status(200)
            .json({ message: `Game with id ${req.params.id} deleted` });
        });
      } else {
        res
          .status(404)
          .json({ message: `Game with id ${req.params.id} not found` });
      }
    })
    .catch((error) => {
      res.status(400).json({
        message: `Error deleting game with id ${req.params.id}`,
        error: error,
      });
    });
});

router.get("", (req, res, next) => {
  const gamesQuery = Game.find();

  gamesQuery
    .then((games) => {
      res.status(200).json({
        message: "Games fetched successfully",
        games: games,
      });
    })
    .catch((error) => {
      res.status(400).json({
        message: "Fetching games failed",
        error: error,
      });
    });
});

router.get("/:id", (req, res, next) => {
  Game.findById(req.params.id)
    .then((game) => {
      if (game) {
        res.status(200).json(game);
      } else {
        res
          .status(404)
          .json({ message: `Game with id ${req.params.id} not found` });
      }
    })
    .catch((error) => {
      res.status(400).json({
        message: "Fetching game failed",
        error: error,
      });
    });
});

router.put("/:id/assign", (req, res, next) => {
  Game.findById(req.params.id)
    .then((game) => {
      if (!game) {
        res
          .status(404)
          .json({ message: `Game with id ${req.params.id} not found` });
        return;
      }
      if (!req.body.users || req.body.users.length === 0) {
        res.status(400).json({ message: `Users array required` });
        return;
      }
      const prevLen = game.participants.length;
      req.body.users.forEach((user) => {
        if (user.operation == "ADD") {
          console.log("adding user ", user.id);
          game.participants.push({ userId: user.id, tokens: 0 });
        } else if (user.operation == "REMOVE") {
          console.log("removing user ", user.id);
          game.participants = game.participants.filter(
            (p) => p.userId !== user.id
          );
        }
      });
      if (game.maxParticipants < game.participants.length) {
        res.status(400).json({
          message: `Cannot add all provided participants to game 
                            (max: ${game.maxParticipants}, with provided: ${game.participants.length})`,
        });
      } else {
        console.log(game.participants.length);
        game
          .save()
          .then(() => {
            // if (
            //   game.participants.length >= game.minParticipants &&
            //   prevLen < game.minParticipants
            // ) {
            //   return createGame(game._id, game.maxParticipants, game.betAmount);
            // }
          })
          .then((createGameRes) => {
            console.log("create?", createGameRes);
            res.status(200).json({
              message: "Participants assigned successfully",
            });
          });
      }
    })
    .catch((error) => {
      res.status(400).json({
        message: "Fetching game failed",
        error: error,
      });
    });
});

router.put("/:id/start", (req, res, next) => {
  Game.findById(req.params.id)
    .then((game) => {
      if (game) {
        if (game.timestampStart > 0) {
          res.status(400).json({
            message: `Game already started at ${new Date(
              game.timestampStart
            ).toString()}`,
          });
        } else {
          if (
            game.participants.length >= game.minParticipants &&
            game.participants.length <= game.maxParticipants
          ) {
            game.timestampStart = Date.now();
            game.save().then(() => {
              res.status(200).json({
                message: `Game ${req.params.id} started at ${new Date(
                  game.timestampStart
                ).toString()}`,
              });
            });
          } else {
            res.status(400).json({
              message: `Game cannot start - participants number mismatch 
                            (max: ${game.maxParticipants}, min: ${game.minParticipants}, current: ${game.participants.length})`,
            });
          }
        }
      } else {
        res
          .status(404)
          .json({ message: `Game with id ${req.params.id} not found` });
      }
    })
    .catch((error) => {
      res.status(400).json({
        message: "Fetching game failed",
        error: error,
      });
    });
});

router.put("/:id/end", (req, res, next) => {
  Game.findById(req.params.id)
    .then((game) => {
      if (game) {
        if (game.timestampEnd > 0) {
          res.status(400).json({
            message: `Game already ended at ${new Date(
              game.timestampEnd
            ).toString()}`,
          });
        } else {
          if (game.timestampStart == 0) {
            res
              .status(400)
              .json({ message: `Cannot end game - game not started` });
          } else {
            if (req.body.winner) {
              game.timestampEnd = Date.now();
              game.winnerId = req.body.winner;
              game
                .save()
                .then(() => winGame(game._id, req.body.winner))
                .then((result) => {
                  console.log(
                    JSON.stringify(
                      typeof result === "function" ? result() : result
                    )
                  );
                  res.status(200).json({
                    message: `Game ${req.params.id} ended at ${new Date(
                      game.timestampEnd
                    ).toString()}`,
                  });
                });
            } else {
              res
                .status(400)
                .json({ message: `Cannot end game - winner not provided` });
            }
          }
        }
      } else {
        res
          .status(404)
          .json({ message: `Game with id ${req.params.id} not found` });
      }
    })
    .catch((error) => {
      res.status(400).json({
        message: "Fetching game failed",
        error: error,
      });
    });
});

router.put("/:id/prize", (req, res, next) => {
  Game.findById(req.params.id)
    .then((game) => {
      if (game) {
        if (req.body.amount) {
          if (game.timestampEnd > 0) {
            res
              .status(400)
              .json({ message: `Game ${req.params.id} already ended` });
          } else if (!req.body.userId) {
            res.status(400).json({ message: `User ID not provided` });
          } else {
            game.prize += Number(req.body.amount);
            game.participants.forEach((p) => {
              if (p.userId == req.body.userId) {
                p.tokens += Number(req.body.amount);
              }
            });
            game.save().then(() => {
              res.status(200).json({
                message: `Game prize updated successfully`,
              });
            });
          }
        } else {
          res.status(400).json({ message: `Token amount not provided` });
        }
      } else {
        res
          .status(404)
          .json({ message: `Game with id ${req.params.id} not found` });
      }
    })
    .catch((error) => {
      res.status(400).json({
        message: "Fetching game failed",
        error: error,
      });
    });
});

module.exports = router;
