module package_owner::videopoker {

	use std::vector;
	use aptos_framework::event::emit;
	use aptos_framework::randomness::next_blob;

	const COUNT2: u64 = 0xffff; 		// 2 ** 16 - 1
	const COUNT3: u64 = 0xffffffff; 	// 2 ** 32 - 1
	const COUNT4: u64 = 0xffffffffffff; // 2 ** 48 - 1

	const EMPTY_DECK: u64 = 0xe000e000e000e000; // 0b1110000000000000111000000000000011100000000000001110000000000000

	const MASK_CARD_0: u64 = 1073741760;	// 0b111111_111111_111111_111111_000000
	const MASK_CARD_1: u64 = 1073737791;	// 0b111111_111111_111111_000000_111111
	const MASK_CARD_2: u64 = 1073483775;	// 0b111111_111111_000000_111111_111111
	const MASK_CARD_3: u64 = 1057226751;	// 0b111111_000000_111111_111111_111111
	const MASK_CARD_4: u64 = 16777215;		// 0b000000_111111_111111_111111_111111

	const MASK_STRAIGHT_A: u64 = 4111;				// 0b1000000001111
	const MASK_STRAIGHT_2: u64 = 31;				// 0b0000000011111
	const MASK_STRAIGHT_3: u64 = 62;				// 0b0000000111110
	const MASK_STRAIGHT_4: u64 = 124;				// 0b0000001111100
	const MASK_STRAIGHT_5: u64 = 248;				// 0b0000011111000
	const MASK_STRAIGHT_6: u64 = 496;				// 0b0000111110000
	const MASK_STRAIGHT_7: u64 = 992;				// 0b0001111100000
	const MASK_STRAIGHT_8: u64 = 1984;				// 0b0011111000000
	const MASK_STRAIGHT_9: u64 = 3968;				// 0b0111110000000
	const MASK_STRAIGHT_HIGH: u64 = 7936;			// 0b1111100000000
	const MASK_JACKS_OR_BETTER: u64 = 503316480;	// 0b1111000000000_0000000000000000

	const JACKS_OR_BETTER: u64 = 1;
	const TWO_PAIR: u64 = 2;
	const THREE_OF_A_KIND: u64 = 3;
	const STRAIGHT: u64 = 4;
	const FLUSH: u64 = 5;
	const FULL_HOUSE: u64 = 6;
	const FOUR_OF_A_KIND: u64 = 7;
	const STRAIGHT_FLUSH: u64 = 8;
	const ROYAL_FLUSH: u64 = 9;

	struct Game has store {
		deck: u64,
		cards: u64
	}

	struct Deck has drop {
		mask: u64,
		seed: vector<u8>,
		index: u64
	}

	#[event]
	struct StartGameEvent has store, drop {
		cards: u64
	}

	#[event]
	struct EndGameEvent has store, drop {
		cards: u64,
		result: u64,
		payout: u64
	}

	public fun start(): Game {
		let deck = Deck {
			mask: EMPTY_DECK,
			seed: next_blob(),
			index: 0
		};
		let cards = card(&mut deck); // cannot do this in on line as there is a borrow error
		cards = cards | card1(&mut deck);
		cards = cards | card2(&mut deck);
		cards = cards | card3(&mut deck);
		cards = cards | card4(&mut deck);
		emit(StartGameEvent {
			cards
		});
		Game {
			deck: deck.mask,
			cards
		}
	}

	/// `change` indicates which cards to change using the last 5 bits
	public fun end(game: Game, change: u8): u64 {
		let Game { deck, cards } = game;
		if(change != 0) {
			let deck = Deck {
				mask: deck,
				seed: next_blob(),
				index: 0
			};
			if(change & 1 != 0) cards = cards & MASK_CARD_0 | card(&mut deck);
			if(change & 2 != 0) cards = cards & MASK_CARD_1 | card1(&mut deck);
			if(change & 4 != 0) cards = cards & MASK_CARD_2 | card2(&mut deck);
			if(change & 8 != 0) cards = cards & MASK_CARD_3 | card3(&mut deck);
			if(change & 16 != 0) cards = cards & MASK_CARD_4 | card4(&mut deck);
		};
		let (result, payout) = get_result(cards);
		emit(EndGameEvent {
			cards,
			result,
			payout
		});
		payout
	}

	/// Generates a card that has not been used before
	fun card(deck: &mut Deck): u64 {
		let n = *vector::borrow(&deck.seed, deck.index) % 64;
		deck.index = deck.index + 1;
		let mask = 1 << n;
		if((deck.mask & mask) == 0) {
			deck.mask = deck.mask | mask;
			(n as u64)
		} else {
			card(deck)
		}
	}

	fun card_impl(deck: &mut Deck, shift: u8): u64 { card(deck) << shift }

	inline fun card1(deck: &mut Deck): u64 { card_impl(deck, 6) }

	inline fun card2(deck: &mut Deck): u64 { card_impl(deck, 12) }

	inline fun card3(deck: &mut Deck): u64 { card_impl(deck, 18) }

	inline fun card4(deck: &mut Deck): u64 { card_impl(deck, 24) }

	fun get_result(cards: u64): (u64, u64) {
		// count cards
		// count is initialized using the first card without doing the `while` check
		let count = 1 << ((cards & 15) as u8);
		// other cards need to perform the offset check
		count = count | offset(count, 1 << ((cards & 960) >> 6 as u8));
		count = count | offset(count, 1 << ((cards & 61440) >> 12 as u8));
		count = count | offset(count, 1 << ((cards & 3932160) >> 18 as u8));
		count = count | offset(count, 1 << ((cards & 251658240) >> 24 as u8));
		if(count <= COUNT2) {
			// all cards have different values, no need to count unique values
			if(count == MASK_STRAIGHT_A || count == MASK_STRAIGHT_2 || count == MASK_STRAIGHT_3
			|| count == MASK_STRAIGHT_4 || count == MASK_STRAIGHT_5 || count == MASK_STRAIGHT_6
			|| count == MASK_STRAIGHT_7 || count == MASK_STRAIGHT_8 || count == MASK_STRAIGHT_9) {
				if(is_flush(cards)) {
					return (STRAIGHT_FLUSH, 50)
				} else {
					return (STRAIGHT, 4)
				}
			} else if(count == MASK_STRAIGHT_HIGH) {
				// treat royal as a special case
				if(is_flush(cards)) {
					return (ROYAL_FLUSH, 250)
				} else {
					return (STRAIGHT, 4)
				}
			} else if(is_flush(cards)) {
				// can only be a flush if a.length is 5
				return (FLUSH, 6)
			}
		} else {
			// count how many different combinations of numbers there are
			// counting the number of 1s in the first 13 bits
			let unique_numbers = count_unique_numbers(count); // must be between 2 and 4
			if(unique_numbers == 2) {
				// there are only two unique numbers
				// must be whether a four of a kind or a full house
				if(count > COUNT4) {
					return (FOUR_OF_A_KIND, 25)
				} else {
					return (FULL_HOUSE, 9)
				}
			} else if(count > COUNT3) {
				// three of a kind
				return (THREE_OF_A_KIND, 3)
			} else if(unique_numbers == 3) {
				// two pair
				return (TWO_PAIR, 2)
			} else if((count & MASK_JACKS_OR_BETTER) != 0) {
				// jacks or better
				return (JACKS_OR_BETTER, 1)
			}
		};
		return (0, 0)
	}

	fun offset(count: u64, ioffset: u64): u64 {
		while((count & ioffset) != 0) {
			ioffset = ioffset << 16;
		};
		ioffset
	}

	fun count_unique_numbers(count: u64): u64 {
		let ret = 0;
		if((count & 1) != 0) ret = ret + 1;
		if((count & 2) != 0) ret = ret + 1;
		if((count & 4) != 0) ret = ret + 1;
		if((count & 8) != 0) ret = ret + 1;
		if((count & 16) != 0) ret = ret + 1;
		if((count & 32) != 0) ret = ret + 1;
		if((count & 64) != 0) ret = ret + 1;
		if((count & 128) != 0) ret = ret + 1;
		if((count & 256) != 0) ret = ret + 1;
		if((count & 512) != 0) ret = ret + 1;
		if((count & 1024) != 0) ret = ret + 1;
		if((count & 2048) != 0) ret = ret + 1;
		if((count & 4096) != 0) ret = ret + 1;
		ret
	}

	fun is_straight(count: u64): bool {
		count == MASK_STRAIGHT_A || count == MASK_STRAIGHT_2 || count == MASK_STRAIGHT_3
			|| count == MASK_STRAIGHT_4 || count == MASK_STRAIGHT_5 || count == MASK_STRAIGHT_6
			|| count == MASK_STRAIGHT_7 || count == MASK_STRAIGHT_8 || count == MASK_STRAIGHT_9
	}

	/**
	 * Indicates whether all the cards have the same suit.
	 */
	fun is_flush(cards: u64): bool {
		let t = cards & 48; 				// 0b110000
			(cards & 3072) >> 6 == t && 		// 0b110000 << 6
			(cards & 196608) >> 12 == t &&		// 0b110000 << 12
			(cards & 12582912) >> 18 == t && 	// 0b110000 << 18
			(cards & 805306368) >> 24 == t		// 0b110000 << 24
	}

	#[test_only]
	fun build_deck(card0: u64, card1: u64, card2: u64, card3: u64, card4: u64): u64 {
		card0 | (card1 << 6) | (card2 << 12) | (card3 << 18) | (card4 << 24)
	}

}
