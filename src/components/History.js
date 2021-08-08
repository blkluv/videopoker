import { useEffect, useState } from "react";
import Cards from "./Cards";
import ContractForm from "./ContractForm";
import { Results } from "../util/const";
import { formatDate, formatNumber } from "../util/format";
import "../styles/history.scss";

function changedToFlipped(changed) {
	return [
		(changed & 16) !== 0,
		(changed & 8) !== 0,
		(changed & 4) !== 0,
		(changed & 2) !== 0,
		(changed & 1) !== 0
	];
}

export default function History({ address = "", page = 1 }) {

	const pageSize = 5;

	const [ contract, setContract ] = useState(null);
	const [ unit, setUnit ] = useState("");

	const [ pages, setPages ] = useState(null);
	const [ games, setGames ] = useState(null);
	const [ loaded, setLoaded ] = useState(null);
	const [ changed, setChanged ] = useState(null);

	useEffect(() => {
		if(contract && games) {
			load(contract, page - 1, games);
		}
	}, [page]);

	useEffect(() => {
		const interval = setInterval(() => changed && load(contract, page - 1, games), 5000);
		return () => clearInterval(interval);
	});

	async function load(contract, page, games) {
		// load pages from games
		const i = page * pageSize;
		const loaded = await Promise.all(games.slice(i, i + pageSize).map(gameId => contract.getGame(gameId)));
		setChanged(loaded.some(game => game.change > 0));
		setLoaded(loaded);
	}

	function updateOrder(event) {
		console.log(event);
	}

	async function initContract(contract, info) {
		if(contract) {
			// load history of played games
			//setGames(await contract.getGames());
			const games = (await contract.getGames()).slice().reverse();
			setGames(games);
			setPages(Math.ceil(games.length / pageSize));
			setUnit(info.unit || "");
			await load(contract, page - 1, games);
			// update hash
			window.location.hash = `#history/${info.address}/${page}`;
		} else {
			setLoaded(null);
			setGames(null);
			setUnit(null);
		}
		setContract(contract);
	}

	return <div className="history-component">
		<ContractForm address={address} setError={console.warn} setContract={initContract} />
		<div className="row">
			<label id="input-order" className="label">Order by</label>
			<div className="value">
				<select id="input-order" disabled onChange={updateOrder}>
					<option value="desc">Newest</option>
					<option value="asc">Oldest</option>
				</select>
			</div>
		</div>
		{loaded && <>
			<div className="row">
				<div style={{width: "100%"}}>
					{loaded.map(game => <div key={game.id} className="history-component-game">
						<div className="date">{formatDate(game.date)}</div>
						<div className="results">
							<fieldset className="cards" disabled>
								<Cards cards={game.cards} flipped={changedToFlipped(game.change || 0)} />
							</fieldset>
							<div className="result">
								{game.playable ? <a href={`/#play/${address}/${game.id}`}>
									<button type="button">Resume</button>
								</a> : game.result ? <>
									<div>{Results[game.result - 1]}</div>
									<div>{formatNumber(game.payout, 8)} {unit}</div>
								</> : ""}
							</div>
						</div>
					</div>)}
				</div>
			</div>
			<div className="row history-component-footer">
				<span>Page {page} of {pages}</span>
				<div className="spacer" />
				<Page enabled={page > 1 && pages > 1} href={`#history/${address}/${page - 1}`}>Previous</Page>
				<Page enabled={page < pages} href={`#history/${address}/${+page + 1}`}>Next</Page>
			</div>
		</>}
	</div>

}

function Page({ enabled, href, children }) {
	if(enabled) {
		return <a className="nav" href={href}><button>{children}</button></a>
	} else {
		return <button className="nav" disabled>{children}</button>
	}
}
