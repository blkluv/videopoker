module package_owner::vault {

	use std::signer::address_of;
	use aptos_framework::coin::{Self, Coin};

	friend package_owner::player;

	/// Bet amount is too low.
	const ELOW_BET: u64 = 0x10;

	struct Vault<phantom T> has key {
		coin: Coin<T>
	}

	struct Bet<phantom T> has store {
		player: address,
		input: u64,
		coin: Coin<T>
	}

	public entry fun deposit<T>(signer: &signer, amount: u64) acquires Vault {
		let owner = address_of(signer);
		let coin = coin::withdraw<T>(signer, amount);
		if(exists<Vault<T>>(owner)) {
			let vault = borrow_global_mut<Vault<T>>(owner);
			coin::merge(&mut vault.coin, coin);
		} else {
			move_to(signer, Vault {
				coin
			});
		}
	}

	public entry fun withdraw<T>(signer: &signer, amount: u64) acquires Vault {
		let owner = address_of(signer);
		let vault = borrow_global_mut<Vault<T>>(owner);
		coin::deposit(owner, coin::extract(&mut vault.coin, amount));
	}

	public(friend) fun play_start<T>(signer: &signer, input: u64): Bet<T> {
		// check signer and balance
		assert!(input >= 100_000, ELOW_BET);
		// extract bet
		let coin = coin::withdraw<T>(signer, input);
		Bet { player: address_of(signer), input, coin }
	}

	public(friend) fun play_end<T>(bet: Bet<T>, output: u64) acquires Vault {
		let Bet { player, input, coin } = bet;
		let bank_vault = borrow_global_mut<Vault<T>>(@package_owner);
		// check transfers
		if(output == 0) {
			coin::merge(&mut bank_vault.coin, coin);
		} else {
			if(output > 1) {
				// win is geater than bet, transfer from bank to player
				let win = input * output;
				coin::merge(&mut coin, coin::extract(&mut bank_vault.coin, win - input));
			};
			coin::deposit(player, coin);
		}
	}

}
