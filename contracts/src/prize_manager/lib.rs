#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod prize_manager {

    use ink::{
        prelude::{string::String, vec::Vec},
        storage::Mapping,
    };

    const DEFAULT_BALANCE: Balance = 0;

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum Error {
        InsufficientBalance,
        GameAlreadyJoined,
        TransactionFailed,
        GameDoesntExist,
        GameAlreadyExists,
        WrongGame,
        Other,
    }

    impl From<ink::env::Error> for Error {
        fn from(err: ink::env::Error) -> Error {
            match err {
                ink::env::Error::TransferFailed => Self::TransactionFailed,
                _ => Self::Other,
            }
        }
    }

    #[ink(event)]
    pub struct GameJoined {
        user: AccountId,
        game: String,
    }

    #[ink(event)]
    pub struct GameWon {
        user: AccountId,
        game: String,
    }

    #[ink(event)]
    pub struct GameCreated {
        bet_amount: Balance,
        game: String,
    }

    #[derive(scale::Encode, scale::Decode, PartialEq, Eq, Debug, Default)]
    #[cfg_attr(
        feature = "std",
        derive(::scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct GamePool {
        players: Vec<AccountId>,
        prize: UserPosessions,
        bet_amount: Balance,
    }

    /// Struct containing user posessions
    #[derive(scale::Encode, scale::Decode, PartialEq, Eq, Debug)]
    #[cfg_attr(
        feature = "std",
        derive(::scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct UserPosessions {
        balance: Balance,
    }

    impl Default for UserPosessions {
        fn default() -> Self {
            Self {
                balance: DEFAULT_BALANCE,
            }
        }
    }

    #[ink(storage)]
    #[derive(Default)]
    pub struct PrizeManager {
        game_pool: Mapping<String, GamePool>,
    }

    impl PrizeManager {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self::default()
        }

        /// creates new game with a specified bet amount and no users that joined
        #[ink(message)]
        pub fn create_game(&mut self, game: String, bet_amount: Balance) -> Result<(), Error> {
            if self.game_pool.contains(game.clone()) {
                return Err(Error::GameAlreadyExists);
            }

            self.game_pool.insert(
                game.clone(),
                &GamePool {
                    bet_amount,
                    ..Default::default()
                },
            );
            Self::env().emit_event(GameCreated { bet_amount, game });
            Ok(())
        }

        /// joins the user to an existing game
        #[ink(message, payable)]
        pub fn join_game(&mut self, game: String) -> Result<(), Error> {
            let user = Self::env().caller();
            let transfered = Self::env().transferred_value();
            let mut game_pool = self
                .game_pool
                .get(game.clone())
                .ok_or(Error::GameDoesntExist)?;
            if transfered < game_pool.bet_amount {
                return Err(Error::InsufficientBalance);
            }
            if game_pool.players.iter().any(|p| p == &user) {
                return Err(Error::GameAlreadyJoined);
            }
            self.env()
                .transfer(Self::env().account_id(), game_pool.bet_amount)?;
            game_pool.players.push(user);
            game_pool.prize.balance += game_pool.bet_amount;
            self.game_pool.insert(game.clone(), &game_pool);
            Self::env().emit_event(GameJoined { user, game });
            Ok(())
        }

        #[ink(message)]
        pub fn win_game(&mut self, winner: AccountId, game: String) -> Result<(), Error> {
            let game_pool = self
                .game_pool
                .get(game.clone())
                .ok_or(Error::GameDoesntExist)?;

            if !game_pool.players.iter().any(|p| p == &winner) {
                return Err(Error::WrongGame);
            }

            self.env().transfer(winner, game_pool.prize.balance)?;
            self.game_pool.remove(game.clone());
            Self::env().emit_event(GameWon { user: winner, game });
            Ok(())
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::{
            test::{default_accounts, get_account_balance, set_caller, set_value_transferred},
            DefaultEnvironment as DE,
        };

        macro_rules! sample_game {
            () => {{
                let mut prize_manager = PrizeManager::new();
                let game_hash = "game_hash";
                let game_bet_amount = 50;
                let res = prize_manager.create_game(game_hash.into(), game_bet_amount);
                (prize_manager, game_hash, game_bet_amount, res)
            }};
        }

        #[ink::test]
        fn add_game_works() {
            let (prize_manager, game_hash, bet_amount, ..) = sample_game!();
            assert_eq!(
                prize_manager.game_pool.get(game_hash.to_owned()),
                Some(GamePool {
                    bet_amount,
                    ..Default::default()
                })
            )
        }

        #[ink::test]
        fn add_duplicate_game_doesnt_work() {
            let (mut prize_manager, game_hash, bet_amount, res) = sample_game!();
            assert_eq!(res, Ok(()));
            assert_eq!(
                prize_manager.create_game(game_hash.into(), bet_amount),
                Err(Error::GameAlreadyExists)
            );
        }

        #[ink::test]
        fn join_game_works() {
            let get_contract_balance = || get_account_balance::<DE>(ink::env::test::callee::<DE>());
            let init_balance = get_contract_balance().unwrap();
            let (mut prize_manager, game_hash, bet_amount, ..) = sample_game!();
            set_value_transferred::<DE>(bet_amount);
            assert_eq!(prize_manager.join_game(game_hash.to_owned()), Ok(()));
            assert_eq!(get_contract_balance(), Ok(init_balance + bet_amount));
        }

        #[ink::test]
        fn join_game_with_insufficient_funds_doesnt_work() {
            let (mut prize_manager, game_hash, bet_amount, ..) = sample_game!();
            set_value_transferred::<DE>(bet_amount - 20);
            assert_eq!(
                prize_manager.join_game(game_hash.to_owned()),
                Err(Error::InsufficientBalance)
            )
        }

        #[ink::test]
        fn join_game_again_doesnt_work() {
            let (mut prize_manager, game_hash, bet_amount, ..) = sample_game!();
            set_value_transferred::<DE>(bet_amount);
            assert_eq!(prize_manager.join_game(game_hash.to_owned()), Ok(()));
            assert_eq!(
                prize_manager.join_game(game_hash.to_owned()),
                Err(Error::GameAlreadyJoined)
            );
        }

        #[ink::test]
        fn join_nonexistant_game_doesnt_work() {
            let mut prize_manager = PrizeManager::default();
            assert_eq!(
                prize_manager.join_game("game_hash".to_owned()),
                Err(Error::GameDoesntExist)
            )
        }

        #[ink::test]
        fn win_game_works() {
            let accounts = default_accounts::<DE>();
            let bob_initial_balance = get_account_balance::<DE>(accounts.bob).unwrap();
            let (mut prize_manager, game_hash, bet_amount, ..) = sample_game!();
            set_value_transferred::<DE>(bet_amount);
            prize_manager.join_game(game_hash.into()).unwrap();
            set_caller::<DE>(accounts.bob);
            prize_manager.join_game(game_hash.into()).unwrap();

            assert_eq!(
                prize_manager.win_game(accounts.bob, game_hash.into()),
                Ok(())
            );
            assert_eq!(
                get_account_balance::<DE>(accounts.bob),
                Ok(bob_initial_balance + 2 * bet_amount)
            )
        }

        #[ink::test]
        fn win_nonexistant_game_doesnt_work() {
            let accounts = default_accounts::<DE>();
            let mut prize_manager = PrizeManager::default();
            assert_eq!(
                prize_manager.win_game(accounts.alice, "game_hash".to_owned()),
                Err(Error::GameDoesntExist)
            )
        }

        #[ink::test]
        fn win_unregistered_game_doesnt_work() {
            let accounts = default_accounts::<DE>();
            let (mut prize_manager, game_hash, ..) = sample_game!();
            assert_eq!(
                prize_manager.win_game(accounts.bob, game_hash.to_owned()),
                Err(Error::WrongGame)
            )
        }
    }
}
