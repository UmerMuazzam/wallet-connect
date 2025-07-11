import {
  WalletConnectModalSign,
  useConnect,
  useRequest,
  useDisconnect,
  useOnSessionDelete,
} from "@walletconnect/modal-sign-react";
import { useEffect, useState } from "react";
import { getTokenDetails } from "./contract/tokenDetails.js";
import { transfer } from "./contract/transfer.js";

const projectId = "9347ff578aef584177e3f430201a9c9d";

export default function HomePage() {
  const [session, setSession] = useState(
    JSON.parse(localStorage.getItem("session")) || {}
  );
  const [account, setAccount] = useState();
  const [chainId, setChainId] = useState();
  const [balance, setBalance] = useState();
  const [disabled, setDisabled] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [tokenDetails, setTokenDetails] = useState("");
  const [transferResponse, setTransferResponse] = useState(null);
  const { disconnect } = useDisconnect();

  const { request, loading } = useRequest();
  console.log("loading>>>>>>>", loading);

  async function sendTransaction() {
    if (!account) {
      setTransactionError("No account connected");
      return;
    }

    setIsSending(true);
    setTransactionError(null);
    setTransactionHash(null);

    try {
      // Example transaction - customize with your actual values
      const transaction = {
        from: account,
        to: "0xb30a70d3c66adfe43c8b26deaf5695349c92a67a", // Replace with actual recipient
        value: "0x1000", // 0.000000000000004096 ETH in hex
        gasLimit: "0x5208", // 21000 in hex
        gasPrice: "0x2540BE400", // 10 Gwei in hex
        // data: "0x..." // Optional data field for contract interactions
      };

      const txHash = await request({
        topic: session.topic,
        chainId: "eip155:9000", // Or use currentChain dynamically
        request: {
          method: "eth_sendTransaction",
          params: [transaction],
        },
      });

      setTransactionHash(txHash);
      console.log("Transaction sent:", txHash);

      // Optionally refresh balance after sending
      await getAccountBalance();
    } catch (error) {
      console.error("Transaction error:", error);
      setTransactionError(error.message || "Transaction failed");
    } finally {
      setIsSending(false);
    }
  }

  const { connect } = useConnect({
    requiredNamespaces: {
      eip155: {
        methods: [
          "eth_requestAccounts",
          "eth_accounts",
          "eth_chainId",
          "eth_getBalance",
          "eth_sendTransaction",
          "personal_sign",
        ],
        chains: [
          "eip155:9000",
          "eip155:1",
          "eip155:11155111",
          "eip155:137",
          "eip155:56",
        ],
        events: ["chainChanged", "accountsChanged"],
      },
    },
  });

  async function handleDisconnect() {
    try {
      if (session) {
        await disconnect({ topic: session?.topic });
        localStorage.removeItem("session");
        console.log("Disconnected successfully");
        setSession({});
        setAccount(null);
        setChainId(null);
        setBalance(null);
        setTransactionHash(null);
        setTransactionError(null);
        setTokenDetails(null);
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  }

  async function onConnect() {
    if (session?.namespaces) {
      handleDisconnect();
      return;
    }
    try {
      setDisabled(true);
      // const session = await connect();
      const { uri, session: session } = await connect();
      
      console.log("URI from connect():", uri);

      localStorage.setItem("session", JSON.stringify(session));
      setSession(session);
    } catch (err) {
      console.error(err);
    } finally {
      setDisabled(false);
    }
  }

  async function getAccount() {
    if (!session) return [];

    setTimeout(() => {
      const response = Object.values(session.namespaces)
        .flatMap((namespace) => namespace.accounts)
        .map((account) => account.split(":")[2]);
      setAccount(response[0]);
      return response;
    }, 1500);
  }

  async function getAccountBalance() {
    try {
      const balance = await request({
        topic: session.topic,
        chainId: "eip155:9000",
        request: {
          method: "eth_getBalance",
          params: [account, "latest"],
        },
      });

      // const ethBalance = parseInt(balance, 16) / 1e18;
      const ethBalance = parseInt(balance, 16);
      setBalance(ethBalance);
    } catch (error) {
      console.error("Balance error:", error);
      return "0";
    }
  }

  async function getChainId() {
    try {
      const response = await request({
        topic: session?.topic,
        chainId: "eip155:9000",
        request: {
          method: "eth_chainId",
          params: [],
        },
      });
      setChainId(response);
    } catch (error) {
      console.log("Chain Id error", error);
    }
  }

  async function handleTokenDetails() {
    // await callContract();

    const response = await getTokenDetails(account);
    console.log("handleTokenDetails", response);
    setTokenDetails(response);
  }

  async function handleTransferToken() {
    const data = {
      from: account,
      to: account, // Replace with actual recipient
      amount: "0.5", // Amount to transfer
      tokenDecimal: tokenDetails.decimals, // Use the decimals from tokenDetails
    };
    const response = await transfer(data, request, session);
    console.log("Transfer response", response);
    setTransferResponse(response);
  }

  useOnSessionDelete((deletedSession) => {
    console.log("session deleted:", deletedSession);
    if (deletedSession.topic === session.topic) {
      localStorage.removeItem("session");
      console.log("Disconnected successfully");
      setSession({});
      setAccount(null);
      setChainId(null);
      setBalance(null);
      setTransactionHash(null);
      setTransactionError(null);
      setTokenDetails(null);
    }
  });

  useEffect(() => {
    const storedSession = localStorage.getItem("session");
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      setSession(parsedSession);
    }
  }, []);

 

  return (
    <div style={styles.pageContainer}>
      <div style={styles.cardContainer}>
        <h1 style={styles.title}>Wallet Connect Demo</h1>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={onConnect}
            style={{
              ...styles.connectButton,
              backgroundColor: session?.namespaces ? "#ef4444" : "#2563eb",
            }}
          >
            {session?.namespaces ? "Disconnect Wallet" : "Connect Wallet"}
          </button>
        </div>

        {session?.namespaces && (
          <div style={{ marginTop: "1.5rem" }}>
            <div style={styles.statusIndicator}>
              <div style={styles.statusDot}></div>
              <span style={styles.statusText}>Connected</span>
            </div>

            <div style={styles.contentBox}>
              {/* Account Section */}
              <div style={{ marginBottom: "1rem" }}>
                <button
                  onClick={getAccount}
                  disabled={loading}
                  style={getButtonStyles(loading)}
                  onMouseOver={(e) => {
                    if (!loading)
                      e.currentTarget.style.backgroundColor = "#d1d5db";
                  }}
                  onMouseOut={(e) => {
                    if (!loading)
                      e.currentTarget.style.backgroundColor = "#e5e7eb";
                  }}
                >
                  Get Account
                </button>
                {account && (
                  <div
                    style={{ ...styles.dataDisplay, wordBreak: "break-all" }}
                  >
                    {account}
                  </div>
                )}
              </div>

              {/* Balance Section */}
              <div style={{ marginBottom: "1rem" }}>
                <button
                  onClick={getAccountBalance}
                  disabled={loading || !account}
                  style={getButtonStyles(loading || !account)}
                >
                  Get Balance
                </button>
                {balance && <div style={styles.dataDisplay}>{balance} ETH</div>}
              </div>

              {/* Chain ID Section */}
              <div style={{ marginBottom: "1rem" }}>
                <button
                  onClick={getChainId}
                  disabled={loading}
                  style={getButtonStyles(loading)}
                >
                  Get Chain ID
                </button>
                {chainId && <div style={styles.dataDisplay}>{chainId}</div>}
              </div>

              {/* Transaction Section */}
              <div style={{ marginBottom: "1rem" }}>
                <button
                  onClick={sendTransaction}
                  disabled={isSending || loading || !account}
                  style={{
                    ...styles.actionButton,
                    backgroundColor: "#f59e0b",
                    color: "white",
                    ...((isSending || loading || !account) &&
                      styles.disabledButton),
                  }}
                >
                  {isSending ? "Sending..." : "Send Test Transaction"}
                </button>

                {transactionHash && (
                  <div style={styles.dataDisplay}>
                    <div>Transaction Hash:</div>
                    <div>{transactionHash}</div>
                  </div>
                )}

                {transactionError && (
                  <div style={styles.errorDisplay}>
                    Error: {transactionError}
                  </div>
                )}
              </div>

              {/* Token Details Section */}
              <div style={{ marginBottom: "1rem" }}>
                <button
                  onClick={handleTokenDetails}
                  disabled={loading || !account}
                  style={getTokenButtonStyles(loading || !account)}
                >
                  Get Token Details
                </button>

                {tokenDetails && (
                  <div style={styles.dataDisplay}>
                    <div style={{ marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: "500" }}>Symbol:</span>{" "}
                      {tokenDetails.symbol}
                    </div>
                    <div style={{ marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: "500" }}>Decimals:</span>{" "}
                      {tokenDetails.decimals}
                    </div>
                    <div>
                      <span style={{ fontWeight: "500" }}>Balance:</span>{" "}
                      {tokenDetails.balance}
                    </div>
                  </div>
                )}

                {tokenDetails && (
                  <div style={styles.marginTop}>
                    <button
                      onClick={handleTransferToken}
                      disabled={loading || !account}
                      style={getButtonStyles2(loading , account)}
                    >
                      Transfer ERC20 token
                    </button>
                    {transferResponse && (
                      <div style={styles.transferResponse}>
                        <div>Transaction Hash:</div>
                        <div>{transferResponse}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <WalletConnectModalSign
          projectId={projectId}
          onDisplayUri={(uri) => {
            console.log("URI displayed:", uri);
            // Store this URI or use it to create deep links
          }}
          providerMetadata={{
            name: "My Dapp",
            description: "My Dapp description",
            url: "https://my-dapp.com",
            icons: ["https://my-dapp.com/logo.png"],
            redirect: {
              native: "", // Your app's deep link
              universal: "", // Fallback URL
            },
          }}
          modalOptions={{
            explorerRecommendedWalletIds: [
              "c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a", // Uniswap Wallet
              "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // Trust Wallet
              "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
            ],
          }}
        />
      </div>
    </div>
  );
}

const getButtonStyles = (isDisabled) => ({
  ...styles.actionButton,
  ...(isDisabled && styles.disabledButton),
});

const getTokenButtonStyles = (isDisabled) => ({
  ...styles.tokenButton,
  ...(isDisabled && styles.disabledButton),
});

const getButtonStyles2 = (loading,account) => {
    const baseStyle = {
      ...styles.transferButton,
      backgroundColor: "rgb(245 158 11)",
      color: "#ffffff",
      cursor: "pointer",
    };

    const disabledStyle = {
      backgroundColor: "#e5e7eb",
      color: "#9ca3af",
      cursor: "not-allowed",
      opacity: 0.5,
    };

    return loading || !account 
      ? { ...baseStyle, ...disabledStyle } 
      : baseStyle;
  };

const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  cardContainer: {
    width: "100%",
    maxWidth: "28rem",
    backgroundColor: "white",
    borderRadius: "0.75rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    padding: "1.5rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    textAlign: "center",
    color: "#1f2937",
    marginBottom: "1.5rem",
  },
  connectButton: {
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    fontWeight: "500",
    color: "white",
    backgroundColor: "#2563eb",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  statusIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  statusDot: {
    width: "0.75rem",
    height: "0.75rem",
    borderRadius: "9999px",
    backgroundColor: "#10b981",
  },
  statusText: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#4b5563",
  },
  contentBox: {
    backgroundColor: "#f3f4f6",
    padding: "1rem",
    borderRadius: "0.5rem",
  },
  actionButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#e5e7eb",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  dataDisplay: {
    padding: "0.75rem",
    backgroundColor: "#f9fafb",
    borderRadius: "0.375rem",
    marginTop: "0.5rem",
    fontSize: "0.875rem",
    fontFamily: "monospace",
    color: "#1f2937",
  },
  tokenButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#8b5cf6",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  errorDisplay: {
    padding: "0.75rem",
    backgroundColor: "#fee2e2",
    borderRadius: "0.375rem",
    marginTop: "0.5rem",
    fontSize: "0.875rem",
    color: "#b91c1c",
  },
  transferButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "rgb(245 158 11)",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  transferButtonDisabled: {
    backgroundColor: "#e5e7eb",
    color: "#9ca3af",
    cursor: "not-allowed",
    opacity: 0.5,
  },
  transferResponse: {
    padding: "0.75rem",
    backgroundColor: "#f9fafb",
    borderRadius: "0.375rem",
    marginTop: "0.5rem",
    wordBreak: "break-all",
    fontSize: "0.875rem",
    fontFamily: "monospace",
    color: "#1f2937",
  },
  marginTop: {
    marginTop: "1rem",
  },
};
