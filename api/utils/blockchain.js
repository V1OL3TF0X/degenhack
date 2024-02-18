const { Keyring, WsProvider, ApiPromise } = require("@polkadot/api");
const { ContractPromise } = require("@polkadot/api-contract");
const { contractTx } = require("@scio-labs/use-inkathon");
const queryOpts = {
  storageDepositLimit: null,
  gasLimit: 3000n * 1000000n,
};

const abiFile = require(`../../contracts/target/ink/prize_manager/prize_manager.json`);
const address = "5CJ9acajsPWrzWhMh2heU3eHaHSKpCkrp7J3TZDbSNVaZY1W";
const keyring = new Keyring({ type: "sr25519" });

let alice;

const wsProvider = new WsProvider("wss://ws.test.azero.dev");
/** @type {ContractPromise | undefined} */
let contract;
ApiPromise.create({ provider: wsProvider }).then((api) => {
  contract = new ContractPromise(api, abiFile, address);
  alice = keyring.addFromUri("//Alice", { name: "Alice default" });
}, console.error);

const createGame = (id, maxParticipants, betAmount) =>
  contract.tx
    .createGame(queryOpts, id, maxParticipants, betAmount)
    .signAndSend(alice, (result) => {
      if (result.status.isInBlock) {
        console.log("in a block");
      } else if (result.status.isFinalized) {
        console.log("finalized");
      }
    });

const winGame = (id, winnerWalletId) =>
  contract.tx
    .winGame(queryOpts, winnerWalletId, id)
    .signAndSend(alice, (result) => {
      if (result.status.isInBlock) {
        console.log("in a block");
      } else if (result.status.isFinalized) {
        console.log("finalized");
      }
    });

const reimbruiseGame = (id) =>
  contract.tx.reimbruiseGame(queryOpts, id).signAndSend(alice, (result) => {
    if (result.status.isInBlock) {
      console.log("in a block");
    } else if (result.status.isFinalized) {
      console.log("finalized");
    }
  });

module.exports = { reimbruiseGame, winGame, createGame };
