import {useEffect, useMemo, useRef, useState} from "react";
import {createContainer} from "unstated-next";
import {AptosClient} from "aptos";
import {useWallet, WalletName} from "@aptos-labs/wallet-adapter-react";
import {InputGenerateTransactionOptions} from "@aptos-labs/ts-sdk";

const ADDRESS_KEY = "wallet_address";

export const AptosContainer = createContainer(() => {

	const { wallet, account, connected, connect: c, disconnect, signAndSubmitTransaction: sast } = useWallet();

	const client = useMemo(() => new AptosClient("https://fullnode.random.aptoslabs.com"), []);

	const connectedRef = useRef(connected);

	const [ { address, lastWallet }, setCached ] = useState<{ address?: string, lastWallet?: WalletName }>({});

	const [ connecting, setConnecting ] = useState<{ callback: (address: string | null) => any } | null>(null);

	async function connect(force = false) {
		if(!wallet || force) {
			if(!force && lastWallet) {
				return connectImpl(lastWallet);
			}
			// open modal
			return new Promise((resolve, reject) => {
				const callback = (address: string | null) => {
					if(address) {
						resolve(address);
					} else {
						reject();
					}
					setConnecting(null);
				};
				setConnecting({ callback });
			});
		}
	}

	async function connectImpl(name: WalletName) {
		c(name);
		for(let i=0; i<100 && !connectedRef.current; i++) {
			// fuck this shit the `connect` should return when the wallet is connected
			await sleep(10);
		}
	}

	async function signAndSubmitTransaction(fn: string, types: string[], args: any[], options?: InputGenerateTransactionOptions) {
		await connect();
		return await sast({
			data: {
				function: fn as any,
				typeArguments: types,
				functionArguments: args
			},
			options
		});
	}

	async function signAndSubmitAndConfirmTransaction(fn: string, types: string[], args: any[], options?: InputGenerateTransactionOptions) {
		const { hash } = await signAndSubmitTransaction(fn, types, args, options);
		return await client.waitForTransactionWithResult(hash);
	}

	useEffect(() => {
		const connected = window.localStorage.getItem(ADDRESS_KEY);
		if(connected) {
			setCached(JSON.parse(connected));
			//connect(wallet);
		}
	}, []);

	useEffect(() => {
		connectedRef.current = connected;
	}, [ connected ]);

	useEffect(() => {
		if(account && wallet) {
			const address = account.address?.toString() ?? null;
			if(address) {
				const lastWallet = wallet.name;
				const cached = { address, lastWallet };
				setCached(cached);
				window.localStorage.setItem(ADDRESS_KEY, JSON.stringify(cached));
			} else {
				setCached({});
				window.localStorage.removeItem(ADDRESS_KEY);
			}
		}
	}, [ account ]);

	return { client, address, connect, signAndSubmitTransaction, signAndSubmitAndConfirmTransaction, connectImpl, connecting, setConnecting, disconnect: () => {
		setCached({});
		window.localStorage.removeItem(ADDRESS_KEY);
		return disconnect();
	} };
});

export const useAptosContext = () => AptosContainer.useContainer();

function sleep(ms: number): Promise<null> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
