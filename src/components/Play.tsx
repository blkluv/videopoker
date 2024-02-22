import { useEffect, useRef, useState } from "react";
import Cards from "./Cards";
import ErrorMessage from "./ErrorMessage";
import * as audio from "../utils/audio";
import { changedToFlipped } from "../utils/cards";
import { Results } from "../utils/const";
import {toBigInt, formatNumber, APT_DECIMALS} from "../utils/format";
import {useAptosContext} from "../contexts/aptos";
import {CASINO_ADDRESS} from "../utils/env";
import WalletButton from "./Wallet";
import Apt from "./Apt";

const ALL_FLIPPED = Array(5).fill(true);
const NONE_FLIPPED = Array(5).fill(false);

export default function Play({ coin }: { coin: string }) {

	const COIN_STORE = `0x1::coin::CoinStore<${coin}>`;

	const cardsWrapper = useRef();

	const { address, client, disconnect, signAndSubmitAndConfirmTransaction } = useAptosContext();

	const [ contract, setContract ] = useState(null);

	const [ playing, setPlaying ] = useState(false);
	const [ loading, setLoading ] = useState(false);

	const [ balance, setBalance ] = useState<number>();

	const [ bet, setBet ] = useState(10000000);
	const [ min, setMinBet ] = useState(1000000);
	const [ max, setMaxBet ] = useState(1000000000);

	const [ cards, setCards ] = useState(0);
	const [ flipped, setFlipped ] = useState(ALL_FLIPPED);
	const [ selected, setSelected ] = useState<boolean[]>([]);

	const [ result, setResult ] = useState<{ index: number, payout: number }>();
	const [ error, setError ] = useState<string>();

	useEffect(() => {
		if(address) {
			//TODO reset?

			// load active game
			client.getAccountResource(address, `${CASINO_ADDRESS}::player::PlayState<${coin}>`).then(({ data }: any) => {
				if(data.current_game.length) {
					const { bet, game } = data.current_game[0];
					setBet(+bet.input);
					setCards(+game.cards);
					setFlipped(NONE_FLIPPED);
					setPlaying(true);
				}
			}).catch(() => {});
			// load balance
			client.getAccountResource(address, COIN_STORE).then(({ data }: any) => {
				setBalance(+data.coin.value);
			}).catch(() => {
				setBalance(0);
			});
			setLoading(false);
		} else {
			setBalance(undefined);
		}
	}, [ address, coin ]);

	useEffect(() => {
		if(balance) {
			setMaxBet(Math.max(balance, 1000000000));
		}
	}, [ balance ]);

	useEffect(() => {
		if(balance) {
			const max = balance - 100000;
			if(bet > max) {
				setBet(Math.max(max, min));
			}
		}
	}, [ balance, bet, min ]);

	async function start() {
		if(bet > balance!) return "Not enough coins to place bet";
		if(bet > max) return "Bet too high";
		if(bet < min) return "Bet too low";
		/*await signAndSubmitAndConfirmTransaction(
			CASINO_ADDRESS + "::vault::deposit",
			[ coin ],
			[ 100_00000000 ]
		);*/
		const response: any = await signAndSubmitAndConfirmTransaction(
			CASINO_ADDRESS + "::player::start",
			[ coin ],
			[ bet! ]
		);
		const { data } = response.events[0];
		setCards(+data.cards);
		setFlipped(NONE_FLIPPED);
		setPlaying(true);
		updateBalance(response);
		//TODO reset hold
		audio.draw();
		/*if(bet > contract.max) {
			throw new Error("Bet too high");
		} else if(bet < contract.min) {
			throw new Error("Bet too low");
		} else if(bet > contract.balance) {
			throw new Error("Insufficient balance");
		} else {
			const previouslyFlipped = flipped;
			setFlipped(ALL_FLIPPED);
			setResult(null);
			setLastBet(address, bet);
			await handleStart(contract.start(bet).finally(() => {
				if(isActive(id)) {
					// restore to previous game in case of cancel/fail
					setFlipped(previouslyFlipped);
				}
			}));
		}*/
	}

	async function end() {
		const input = bet!;
		let change = 0;
		const flipped = [];
		for(let i=0; i<5; i++) {
			if(!selected[i]) {
				change |= 1 << i;
				flipped[i] = 1;
			}
		}
		setFlipped(flipped);
		const response: any = await signAndSubmitAndConfirmTransaction(
			CASINO_ADDRESS + "::player::end",
			[ coin ],
			[ change ]
		).catch(() => null);
		setFlipped(NONE_FLIPPED);
		if(response) {
			const { data } = response.events[0];
			setCards(+data.cards);
			setPlaying(false);
			setResult({
				index: +data.result,
				payout: +data.payout * input
			});
			setSelected([]);
			if(+data.payout) {
				audio.win();
			} else {
				audio.loss();
			}
			updateBalance(response);
		}
	}

	function updateBalance(response: any) {
		const { data } = response.changes.find(({ data }: any) => data.type === COIN_STORE);
		setBalance(+data.data.coin.value);
	}

	async function submit(event: any) {
		event.preventDefault();
		setResult(undefined);
		setError(undefined);
		setLoading(true);
		try {
			const error = await (playing ? end : start)();
			if(error) {
				setError(error);
			}
		} finally {
			setLoading(false);
		}
	}

	return <div className="play-component">
		<form onSubmit={submit}>
			<fieldset disabled={loading}>
				<div className="row">
					<label htmlFor="input-balance" className="label">Balance</label>
					<div className="value row">
						<input id="input-balance" disabled={true} value={balance ? formatNumber(balance) : ""} />
						<button type="button" onClick={disconnect} style={{ marginLeft: ".5rem", width: "11rem" }} disabled={!address}>Disconnect</button>
					</div>
				</div>
				<div className="row">
					<label htmlFor="input-bet" className="label">Bet</label>
					<fieldset className="value group" disabled={playing}>
						<input id="input-bet" autoComplete="off" name="bet" spellCheck={false} value={bet / APT_DECIMALS} onChange={({ target }: any) => setBet(target.value * APT_DECIMALS)} />
						<button type="button" onClick={() => setBet(min)}>Min</button>
						<button type="button" onClick={() => setBet(max)}>Max</button>
					</fieldset>
				</div>
				<fieldset className="row play-component-cards" disabled={!playing}>
					<Cards cards={cards} flipped={flipped} selected={selected} onSelected={playing ? setSelected : undefined} />
				</fieldset>
				<div className="row">
					{address && <button type="submit" className={`play-component-play-button${loading ? " loading" : ""}`}>
						{playing ? "Draw" : "Deal"}
					</button>}
					{!address && <WalletButton />}
				</div>
				{result && <div className="row">
					<div className="play-component-result">
						{result.index === 0 ? <div>No combinations</div> : <>
							<div>{Results[result.index - 1]}</div>
							<div className="amount"><Apt value={result.payout} /></div>
						</>}
					</div>
				</div>}
				{error && <div className="row">
					<ErrorMessage error={error} />
				</div>}
			</fieldset>
		</form>
	</div>

}
