import {useAptosContext} from "../contexts/aptos";
import {APT_DECIMALS, formatNumber} from "../utils/format";
import WalletButton from "../components/Wallet";
import {useState} from "react";
import {Results} from "../utils/const";
import Apt from "../components/Apt";
import ErrorMessage from "../components/ErrorMessage";

const AIRDROP = 5 * APT_DECIMALS;

async function airdrop(address: string, amount: number) {
	const request = await fetch(`https://faucet.random.aptoslabs.com/mint?address=${address}&amount=${amount}`, {
		method: "POST",
		body: null
	});
	return request.status === 200;
}

export default function Faucet() {

	const { address, client } = useAptosContext();

	const [ loading, setLoading ] = useState(false);
	const [ response, setResponse ] = useState<[ boolean, string ]>();

	async function onClick(address: string) {
		setResponse(undefined);
		setLoading(true);
		if(await airdrop(address, AIRDROP).catch(() => null)) {
			setResponse([ true, `Airdropped ${formatNumber(AIRDROP)} APT to ${address.slice(0, 6)}...${address.slice(-6)}`]);
		} else {
			setResponse([ false, "Error while calling faucet" ]);
		}
		setLoading(false);
	}

	return <div className="play-component faucet-component">
		<div className="row">
			{!address && <WalletButton />}
			{address && <button className="play-component-play-button" disabled={loading} onClick={() => onClick(address)}>
				Airdrop {formatNumber(AIRDROP)} APT
			</button>}
		</div>
		{response?.[0] === true && <div className="row">
			<div className="play-component-result">
				<div className="amount">{response[1]}</div>
			</div>
		</div>}
		{response?.[0] === false && <div className="row">
			<ErrorMessage error={response[1]} />
		</div>}
	</div>
}
