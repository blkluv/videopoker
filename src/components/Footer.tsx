import Link from "next/link";

export default function Footer() {

	return <div className="footer-component">
		<div className="links">
			<div>
				<Link href="/">Play</Link>
				<Link href="/payouts">Payouts</Link>
				<Link href="/faucet">Faucet</Link>
				<a href="https://github.com/Kripth/aptos-videopoker/blob/master/README.md" target="_blank" rel="noreferrer">About</a>
				<a href="https://github.com/Kripth/aptos-videopoker" target="_blank" rel="noreferrer">GitHub</a>
			</div>
		</div>
		<div className="suits">
			<div className="suit hearts" />
			<div className="suit spades" />
			<div className="suit diamonds" />
			<div className="suit clubs" />
		</div>
	</div>
}
