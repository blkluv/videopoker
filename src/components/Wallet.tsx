import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Modal from "./Modal";
import { useAptosContext } from "../contexts/aptos";
import { Wallet } from "@aptos-labs/wallet-adapter-core";

export default function WalletButton() {
  const { wallets = [] } = useWallet();
  const { address, connect, connectImpl, connecting, setConnecting, disconnect } = useAptosContext();

  return (
    <>
      <button
        type="button"
        className="play-component-play-button"
        onClick={() => connect(true)}
      >
        Connect Wallet
      </button>
      {connecting && (
        <Modal title="Connect Wallet" size="sm" onClose={() => connecting?.callback?.(null)}>
          <div className="connect-wallet-modal">
            {wallets?.map((wallet) => {
              if ("readyState" in wallet && wallet.readyState === "Installed") {
                return (
                  <div
                    key={wallet.name}
                    className="connect-wallet"
                    onClick={() =>
                      connectImpl(wallet.name)
                        .then(() => connecting?.callback?.("test"))
                        .catch(() => connecting?.callback?.(null))
                    }
                  >
                    <WalletContent wallet={wallet} />
                  </div>
                );
              } else {
                return (
                  <a
                    key={wallet.name}
                    className="connect-wallet"
                    href={wallet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WalletContent wallet={wallet} />
                    <div className="install">Install</div>
                  </a>
                );
              }
            })}
          </div>
        </Modal>
      )}
    </>
  );
}

// ✅ Fix: Allow WalletContent to handle different wallet types safely
function WalletContent({ wallet }: { wallet: Partial<Wallet<string>> & { name: string } }) {
  return (
    <>
      <div className="icon">
        <img src={`/images/wallet/${wallet.name}.svg`} alt={wallet.name} />
      </div>
      <div className="name">{wallet.name}</div>
    </>
  );
}
