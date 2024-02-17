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
        InsufficientBalance(Balance),
        GameAlreadyJoined,
        MaxPlayersReached,
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

    #[derive(scale::Encode, scale::Decode, PartialEq, Eq, Debug, Default)]
    #[cfg_attr(
        feature = "std",
        derive(::scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct GamePool {
        max_players: u32,
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
        pub fn create_game(
            &mut self,
            game: String,
            max_players: u32,
            bet_amount: Balance,
        ) -> Result<(), Error> {
            if self.game_pool.contains(game.clone()) {
                return Err(Error::GameAlreadyExists);
            }
            self.game_pool.insert(
                game,
                &GamePool {
                    bet_amount,
                    max_players,
                    ..Default::default()
                },
            );
            Ok(())
        }

        /// joins the user to an existing game
        #[ink(message, payable)]
        pub fn join_game(&mut self, game: String) -> Result<(), Error> {
            let user = Self::env().caller();
            let transfered = Self::env().transferred_value();
            let mut game_data = self
                .game_pool
                .get(game.clone())
                .ok_or(Error::GameDoesntExist)?;
            if game_data.players.len() as u32 >= game_data.max_players {
                return Err(Error::MaxPlayersReached);
            }
            if transfered < game_data.bet_amount {
                return Err(Error::InsufficientBalance(game_data.bet_amount));
            }
            if game_data.players.iter().any(|p| p == &user) {
                return Err(Error::GameAlreadyJoined);
            }
            game_data.players.push(user);
            game_data.prize.balance += game_data.bet_amount;
            self.game_pool.insert(game, &game_data);
            Ok(())
        }

        #[ink(message)]
        pub fn win_game(&mut self, winner: AccountId, game: String) -> Result<(), Error> {
            #[cfg(not(test))]
            let before = self.env().gas_left();
            #[cfg(test)]
            let before = 0;
            let game_data = self
                .game_pool
                .get(game.clone())
                .ok_or(Error::GameDoesntExist)?;

            if !game_data.players.iter().any(|p| p == &winner) {
                return Err(Error::WrongGame);
            }
            self.game_pool.remove(game);
            #[cfg(not(test))]
            let after = self.env().gas_left();
            #[cfg(test)]
            let after = 0;

            let gas_fee = self.env().weight_to_fee(before - after);
            let prize_balance = if gas_fee <= self.env().balance() {
                game_data.prize.balance
            } else {
                game_data.prize.balance - gas_fee
            };
            Self::env().transfer(winner, prize_balance)?;
            Ok(())
        }

        #[ink(message)]
        pub fn reimbruise_game(&mut self, game: String) -> Result<(), Error> {
            #[cfg(not(test))]
            let before = self.env().gas_left();
            #[cfg(test)]
            let before = 0;
            let game_data = self
                .game_pool
                .get(game.clone())
                .ok_or(Error::GameDoesntExist)?;

            self.game_pool.remove(game);
            #[cfg(not(test))]
            let after = self.env().gas_left();
            #[cfg(test)]
            let after = 0;

            let gas_fee = self.env().weight_to_fee(before - after);
            let reimbruisement = if gas_fee <= self.env().balance() {
                game_data.bet_amount
            } else {
                game_data.bet_amount - (gas_fee / game_data.players.len() as u128)
            };
            let transfer_reimbrusement = |p| Self::env().transfer(p, reimbruisement);
            game_data
                .players
                .into_iter()
                .try_for_each(transfer_reimbrusement)?;
            Ok(())
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::{
            test::{
                default_accounts, get_account_balance, set_caller, set_value_transferred,
                transfer_in, DefaultAccounts,
            },
            DefaultEnvironment as DE,
        };

        macro_rules! sample_game {
            ($max_players:expr) => {{
                let mut prize_manager = PrizeManager::new();
                let game_hash = "game_hash";
                let game_bet_amount = 50;
                let res =
                    prize_manager.create_game(game_hash.into(), $max_players, game_bet_amount);
                (prize_manager, game_hash, game_bet_amount, res)
            }};
        }

        #[ink::test]
        fn add_game_works() {
            let max_players = 1;
            let (prize_manager, game_hash, bet_amount, ..) = sample_game!(max_players);
            assert_eq!(
                prize_manager.game_pool.get(game_hash.to_owned()),
                Some(GamePool {
                    bet_amount,
                    max_players,
                    ..Default::default()
                })
            )
        }

        #[ink::test]
        fn add_duplicate_game_doesnt_work() {
            let (mut prize_manager, game_hash, bet_amount, res) = sample_game!(1);
            assert_eq!(res, Ok(()));
            assert_eq!(
                prize_manager.create_game(game_hash.into(), 1, bet_amount),
                Err(Error::GameAlreadyExists)
            );
        }

        #[ink::test]
        fn join_game_works() {
            let get_contract_balance = || get_account_balance::<DE>(ink::env::test::callee::<DE>());
            let init_balance = get_contract_balance().unwrap();
            let (mut prize_manager, game_hash, bet_amount, ..) = sample_game!(1);
            set_value_transferred::<DE>(bet_amount);
            assert_eq!(prize_manager.join_game(game_hash.to_owned()), Ok(()));
            transfer_in::<DE>(bet_amount);
            assert_eq!(get_contract_balance(), Ok(init_balance + bet_amount));
        }

        #[ink::test]
        fn join_game_with_insufficient_funds_doesnt_work() {
            let (mut prize_manager, game_hash, bet_amount, ..) = sample_game!(2);
            set_value_transferred::<DE>(bet_amount - 20);
            assert_eq!(
                prize_manager.join_game(game_hash.to_owned()),
                Err(Error::InsufficientBalance(bet_amount))
            )
        }

        #[ink::test]
        fn join_saturated_game_doesnt_work() {
            let accounts = default_accounts::<DE>();
            let (mut prize_manager, game_hash, bet_amount, ..) = sample_game!(2);
            set_value_transferred::<DE>(bet_amount);
            assert_eq!(prize_manager.join_game(game_hash.to_owned()), Ok(()));
            set_caller::<DE>(accounts.bob);
            assert_eq!(prize_manager.join_game(game_hash.to_owned()), Ok(()));
            set_caller::<DE>(accounts.charlie);
            assert_eq!(
                prize_manager.join_game(game_hash.to_owned()),
                Err(Error::MaxPlayersReached)
            );
        }

        #[ink::test]
        fn join_game_again_doesnt_work() {
            let (mut prize_manager, game_hash, bet_amount, ..) = sample_game!(2);
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
            let (mut prize_manager, game_hash, bet_amount, ..) = sample_game!(2);
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
            let (mut prize_manager, game_hash, ..) = sample_game!(2);
            assert_eq!(
                prize_manager.win_game(accounts.bob, game_hash.to_owned()),
                Err(Error::WrongGame)
            )
        }

        #[ink::test]
        fn reimbruise_game_works() {
            let DefaultAccounts { charlie, bob, .. } = default_accounts::<DE>();
            let (mut prize_manager, game_hash, bet_amount, ..) = sample_game!(2);

            let init_charlie_balance = get_account_balance::<DE>(charlie);
            let init_bob_balance = get_account_balance::<DE>(bob);
            set_value_transferred::<DE>(bet_amount);
            set_caller::<DE>(charlie);
            prize_manager.join_game(game_hash.to_owned()).unwrap();
            transfer_in::<DE>(bet_amount);
            set_caller::<DE>(bob);
            prize_manager.join_game(game_hash.to_owned()).unwrap();
            transfer_in::<DE>(bet_amount);
            println!("{:?}", get_account_balance::<DE>(charlie));
            println!("{:?}", get_account_balance::<DE>(bob));
            assert_eq!(prize_manager.reimbruise_game(game_hash.to_owned()), Ok(()));
            assert_eq!(get_account_balance::<DE>(charlie), init_charlie_balance);
            assert_eq!(get_account_balance::<DE>(bob), init_bob_balance);
        }
    }
}
