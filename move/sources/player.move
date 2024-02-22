module package_owner::player {

	use std::signer::address_of;
	use std::vector;
	use package_owner::videopoker;
	use package_owner::vault;

	/// There is a game already in progress for this player.
	const EGAME_IN_PROGRESS: u64 = 0x20;

	struct PlayState<phantom T> has key {
		current_game: vector<CurrentGame<T>>
	}

	struct CurrentGame<phantom T> has store {
		bet: vault::Bet<T>,
		game: videopoker::Game
	}

	entry fun start<T>(signer: &signer, amount: u64) acquires PlayState {
		let player = address_of(signer);
		let game = videopoker::start();
		let bet = vault::play_start<T>(signer, amount);
		let current_game = CurrentGame {
			bet,
			game
		};
		if(!exists<PlayState<T>>(player)) {
			move_to(signer, PlayState {
				current_game: vector[current_game]
			});
		} else {
			let state = borrow_global_mut<PlayState<T>>(player);
			assert!(vector::is_empty(&state.current_game), EGAME_IN_PROGRESS);
			vector::push_back(&mut state.current_game, current_game);
		}
	}

	entry fun end<T>(signer: &signer, change: u8) acquires PlayState {
		let state = borrow_global_mut<PlayState<T>>(address_of(signer));
		let CurrentGame { bet, game } = vector::pop_back(&mut state.current_game);
		let output = videopoker::end(game, change);
		vault::play_end(bet, output);
	}

}
