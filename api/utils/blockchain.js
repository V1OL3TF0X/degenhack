const { Keyring, WsProvider, ApiPromise } = require("@polkadot/api");
const { ContractPromise } = require("@polkadot/api-contract");

const queryOpts = {
  storageDepositLimit: null,
  gasLimit: 3000n * 1000000n,
};

const abiFile = import(
  `../../contracts/target/ink/prize_manager/prize_manager.json`
);
const address = "5CJ9acajsPWrzWhMh2heU3eHaHSKpCkrp7J3TZDbSNVaZY1W";
const keyring = new Keyring({ type: "sr25519" });

const alice = keyring.addFromUri("//Alice", { name: "Alice default" });

const wsProvider = new WsProvider("wss://ws.test.azero.dev");
/** @type {ContractPromise | undefined} */
let contract;
Promise.all([ApiPromise.create({ provider: wsProvider }), abiFile]).then(
  ([api, abi]) => (contract = new ContractPromise(api, abi, address)),
  console.error
);

export const createGame = async (id, maxParticipants, betAmount) => {
  await contract.tx
    .createGame(queryOpts, id, maxParticipants, betAmount)
    .signAndSend(alice, (result) => {
      if (result.status.isInBlock) {
        console.log("in a block");
      } else if (result.status.isFinalized) {
        console.log("finalized");
      }
    });
};

export const winGame = async (id, winnerWalletId) => {
  await contract.tx
    .winGame(queryOpts, winnerWalletId, id)
    .signAndSend(alice, (result) => {
      if (result.status.isInBlock) {
        console.log("in a block");
      } else if (result.status.isFinalized) {
        console.log("finalized");
      }
    });
};

export const reimbruiseGame = async (id) => {
  await contract.tx
    .reimbruiseGame(queryOpts, id)
    .signAndSend(alice, (result) => {
      if (result.status.isInBlock) {
        console.log("in a block");
      } else if (result.status.isFinalized) {
        console.log("finalized");
      }
    });
};
