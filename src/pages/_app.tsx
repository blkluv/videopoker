import {AppProps} from "next/app";
import React, {useMemo} from "react";
import "../styles/_.scss";
import "@fortawesome/fontawesome-svg-core/styles.css";
import {WindowContainer} from "../contexts/window";
import {AptosContainer} from "../contexts/aptos";
import {MartianWallet} from "@martianwallet/aptos-wallet-adapter";
import {RiseWallet} from "@rise-wallet/wallet-adapter";
import {PontemWallet} from "@pontem/wallet-adapter-plugin";
import {FewchaWallet} from "fewcha-plugin-wallet-adapter";
import {AptosWalletAdapterProvider} from "@aptos-labs/wallet-adapter-react";
import {PetraWallet} from "petra-plugin-wallet-adapter";
import Footer from "../components/Footer";

export default function MyApp({ Component, pageProps }: AppProps) {

	const wallets = useMemo(() => [
		new MartianWallet(),
		new PetraWallet(),
		new FewchaWallet(),
		new PontemWallet(),
		new RiseWallet()
	], []);

	return <div>
		<WindowContainer.Provider>
			<AptosWalletAdapterProvider plugins={wallets}>
				<AptosContainer.Provider>
					<div className="app-component">
						<div className="app-component-title">VideoPoker</div>
						<div className="app-component-content">
							<Component {...pageProps} />
						</div>
						<Footer />
					</div>
				</AptosContainer.Provider>
			</AptosWalletAdapterProvider>
		</WindowContainer.Provider>
	</div>
}
