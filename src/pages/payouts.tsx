import { useRef, useState } from "react";
import Cards from "../components/Cards";
import { Value, Suit, Results } from "../utils/const";
import {formatNumber} from "../utils/format";
import Apt from "../components/Apt";

const payouts = [ 1, 2, 3, 4, 6, 9, 25, 50, 250 ];

const combinations = [
	[Suit.hearts | Value.jack, Suit.clubs | Value.jack],
	[Suit.clubs | Value.two, Suit.spades | Value.two, Suit.clubs | Value.king, Suit.diamonds | Value.king],
	[Suit.hearts | Value.three, Suit.diamonds | Value.three, Suit.spades | Value.three],
	[Suit.clubs | Value.ace, Suit.clubs | Value.two, Suit.spades | Value.three, Suit.hearts | Value.four, Suit.clubs | Value.five],
	[Value.seven, Value.ace, Value.king, Value.three, Value.ten],
	[Suit.hearts | Value.two, Suit.clubs | Value.two, Suit.hearts | Value.ace, Suit.clubs | Value.ace, Suit.diamonds | Value.ace],
	[Suit.hearts | Value.ace, Suit.diamonds | Value.ace, Suit.clubs | Value.ace, Suit.spades | Value.ace],
	[Value.ace, Value.two, Value.three, Value.four, Value.five],
	[Value.ten, Value.jack, Value.queen, Value.king, Value.ace]
].map(deck => {
	const pad = 5 - deck.length;
	return {
		cards: Array(pad).fill(0).concat(deck),
		flipped: Array(pad).fill(1)
	};
});

export default function Payouts() {

	const [ bet, setBet ] = useState(100000000);

	return <div>
		<div className="row">
			<label htmlFor="input-bet" className="label">Bet</label>
			<div className="value">
				<input id="input-bet" autoComplete="off" spellCheck={false} value={formatNumber(bet)} onChange={console.log} />
			</div>
		</div>
		<fieldset disabled>
			{payouts && combinations.map(({ cards, flipped }, i) => <div key={i} className="row results">
				<div className="cards">
					<Cards cards={cards} flipped={flipped} />
				</div>
				<div className="result">
					<div>{Results[i]}</div>
					<div className="amount">
						<Apt value={bet * payouts[i]} />
					</div>
				</div>
			</div>)}
		</fieldset>
	</div>

}
