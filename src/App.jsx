import {
  WalletConnectModalSign,
  useConnect,
  useRequest,
  useDisconnect,
} from "@walletconnect/modal-sign-react";
import { useEffect, useState } from "react";
import { getTokenDetails } from "./contract/tokenDetails.js";
import { transfer } from "./contract/transfer.js";

const projectId = "9347ff578aef584177e3f430201a9c9d";

export default function HomePage() {
  const [session, setSession] = useState(
    JSON.parse(localStorage.getItem("session")) || {}
  );
  console.log("session >>>>>>>>>>>>>>>>>>", session);
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
        await disconnect({ topic: session.topic });
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
      const session = await connect();
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

      const ethBalance = parseInt(balance, 16) / 1e18;
      setBalance(ethBalance.toFixed(4));
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

  useEffect(() => {
    const storedSession = localStorage.getItem("session");
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      setSession(parsedSession);
      // if (parsedSession.namespaces) {
      //   getAccount();
      //   getChainId();
      // }
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "28rem",
          backgroundColor: "white",
          borderRadius: "0.75rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          padding: "1.5rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            textAlign: "center",
            color: "#1f2937",
            marginBottom: "1.5rem",
          }}
        >
          Wallet Connect Demo
        </h1>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={onConnect}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              fontWeight: "500",
              color: "white",
              backgroundColor: "#2563eb",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {session?.namespaces ? "Disconnect Wallet" : "Connect Wallet"}
          </button>
        </div>

        {session?.namespaces && (
          <div style={{ marginTop: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "0.75rem",
                  height: "0.75rem",
                  borderRadius: "9999px",
                  backgroundColor: "#10b981",
                }}
              ></div>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#4b5563",
                }}
              >
                Connected
              </span>
            </div>

            <div
              style={{
                backgroundColor: "#f3f4f6",
                padding: "1rem",
                borderRadius: "0.5rem",
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <button
                  onClick={getAccount}
                  disabled={loading}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "background-color 0.2s",
                  }}
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
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#f9fafb",
                      borderRadius: "0.375rem",
                      marginTop: "0.5rem",
                      wordBreak: "break-all",
                      fontSize: "0.875rem",
                      fontFamily: "monospace",
                      color: "#1f2937",
                    }}
                  >
                    {account}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <button
                  onClick={getAccountBalance}
                  disabled={loading || !account}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor:
                      loading || !account ? "#e5e7eb" : "#e5e7eb",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: loading || !account ? "#9ca3af" : "#374151",
                    border: "none",
                    cursor: loading || !account ? "not-allowed" : "pointer",
                    transition: "background-color 0.2s",
                    opacity: loading || !account ? 0.5 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!loading && account)
                      e.currentTarget.style.backgroundColor = "#d1d5db";
                  }}
                  onMouseOut={(e) => {
                    if (!loading && account)
                      e.currentTarget.style.backgroundColor = "#e5e7eb";
                  }}
                >
                  Get Balance
                </button>
                {balance && (
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#f9fafb",
                      borderRadius: "0.375rem",
                      marginTop: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#1f2937",
                    }}
                  >
                    {balance} ETH
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={getChainId}
                  disabled={loading}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "background-color 0.2s",
                    marginBottom: "1rem",
                  }}
                  onMouseOver={(e) => {
                    if (!loading)
                      e.currentTarget.style.backgroundColor = "#d1d5db";
                  }}
                  onMouseOut={(e) => {
                    if (!loading)
                      e.currentTarget.style.backgroundColor = "#e5e7eb";
                  }}
                >
                  Get Chain ID
                </button>
                {chainId && (
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#f9fafb",
                      borderRadius: "0.375rem",
                      marginTop: "0.5rem",
                      fontSize: "0.875rem",
                      fontFamily: "monospace",
                      color: "#1f2937",
                      marginBottom: "1rem",
                    }}
                  >
                    {chainId}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <button
                  onClick={sendTransaction}
                  disabled={isSending || loading || !account}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor:
                      isSending || loading || !account ? "#e5e7eb" : "#f59e0b",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color:
                      isSending || loading || !account ? "#9ca3af" : "#ffffff",
                    border: "none",
                    cursor:
                      isSending || loading || !account
                        ? "not-allowed"
                        : "pointer",
                    transition: "background-color 0.2s",
                    opacity: isSending || loading || !account ? 0.5 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!isSending && !loading && account)
                      e.currentTarget.style.backgroundColor = "#d97706";
                  }}
                  onMouseOut={(e) => {
                    if (!isSending && !loading && account)
                      e.currentTarget.style.backgroundColor = "#f59e0b";
                  }}
                >
                  {isSending ? "Sending..." : "Send Test Transaction"}
                </button>

                {transactionHash && (
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#f9fafb",
                      borderRadius: "0.375rem",
                      marginTop: "0.5rem",
                      wordBreak: "break-all",
                      fontSize: "0.875rem",
                      fontFamily: "monospace",
                      color: "#1f2937",
                    }}
                  >
                    <div>Transaction Hash:</div>
                    <div>{transactionHash}</div>
                  </div>
                )}

                {transactionError && (
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#fee2e2",
                      borderRadius: "0.375rem",
                      marginTop: "0.5rem",
                      fontSize: "0.875rem",
                      color: "#b91c1c",
                    }}
                  >
                    Error: {transactionError}
                  </div>
                )}
              </div>
              <button
                onClick={handleTokenDetails}
                disabled={loading || !account}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: loading || !account ? "#e5e7eb" : "#8b5cf6",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: loading || !account ? "#9ca3af" : "#ffffff",
                  border: "none",
                  cursor: loading || !account ? "not-allowed" : "pointer",
                  transition: "background-color 0.2s",
                  opacity: loading || !account ? 0.5 : 1,
                }}
                onMouseOver={(e) => {
                  if (!loading && account)
                    e.currentTarget.style.backgroundColor = "#7c3aed";
                }}
                onMouseOut={(e) => {
                  if (!loading && account)
                    e.currentTarget.style.backgroundColor = "#8b5cf6";
                }}
              >
                Get Token Details
              </button>
              {tokenDetails && (
                <div style={{ marginBottom: "1rem" }}>
                  {tokenDetails && (
                    <div
                      style={{
                        padding: "0.75rem",
                        backgroundColor: "#f9fafb",
                        borderRadius: "0.375rem",
                        marginTop: "1rem",
                        fontSize: "0.875rem",
                        fontFamily: "monospace",
                        color: "#1f2937",
                      }}
                    >
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
                </div>
              )}

              {tokenDetails && (
                <div style={{ marginTop: "1rem" }}>
                  <button
                    onClick={handleTransferToken}
                    disabled={loading || !account}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor:
                        loading || !account ? "#e5e7eb" : "rgb(245 158 11)",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: loading || !account ? "#9ca3af" : "#ffffff",
                      border: "none",
                      cursor: loading || !account ? "not-allowed" : "pointer",
                      transition: "background-color 0.2s",
                      opacity: loading || !account ? 0.5 : 1,
                    }}
                  >
                    Transfer ERC20 token
                  </button>
                  {transferResponse && (
                    <div
                      style={{
                        padding: "0.75rem",
                        backgroundColor: "#f9fafb",
                        borderRadius: "0.375rem",
                        marginTop: "0.5rem",
                        wordBreak: "break-all",
                        fontSize: "0.875rem",
                        fontFamily: "monospace",
                        color: "#1f2937",
                      }}
                    >
                      <div>Transaction Hash:</div>
                      <div>{transferResponse}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <WalletConnectModalSign
        projectId={projectId}
        providerMetadata={{
          name: "My Dapp",
          description: "My Dapp description",
          url: "https://my-dapp.com",
          icons: ["https://my-dapp.com/logo.png"],
          redirect: {
            native: "myapp://", // Your app's deep link
            universal: "https://my-dapp.com", // Fallback URL
          },
        }}
        modalOptions={{
          explorerRecommendedWalletIds: [
            "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask 
          ],
          enableExplorer: true,
          explorerExcludedWalletIds: "NONE",
        }}
      />
    </div>
  );
}
