import {
  WalletConnectModalSign,
  useConnect,
  useRequest,
} from "@walletconnect/modal-sign-react";
import { useState } from "react";

const projectId = "9347ff578aef584177e3f430201a9c9d";

export default function HomePage() {
  const [session, setSession] = useState({});
  const [account, setAccount] = useState();
  const [chainId, setChainId] = useState();
  const [balance, setBalance] = useState();
  const { request, loading } = useRequest();
  const [disabled, setDisabled] = useState(false);

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
        chains: ["eip155:1", "eip155:11155111", "eip155:137", "eip155:56"],
        events: ["chainChanged", "accountsChanged"],
      },
    },
  });

  async function onConnect() {
    try {
      setDisabled(true);
      const session = await connect();
      setSession(session);
    } catch (err) {
      console.error(err);
    } finally {
      setDisabled(false);
    }
  }

  async function getAccount() {
    if (!session) return [];

    const response = Object.values(session.namespaces)
      .flatMap((namespace) => namespace.accounts)
      .map((account) => account.split(":")[2]);
    setAccount(response[0]);
    return response;
  }

  async function getAccountBalance() {
    try {
      const balance = await request({
        topic: session.topic,
        chainId: "eip155:1",
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
    const response = await request({
      topic: session?.topic,
      chainId: "eip155:1",
      request: {
        method: "eth_chainId",
        params: [],
      },
    });
    setChainId(response);
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '28rem',
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        padding: '1.5rem'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#1f2937',
          marginBottom: '1.5rem'
        }}>Wallet Connect Demo</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onConnect}
            disabled={loading || disabled}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: '500',
              color: 'white',
              backgroundColor: loading || disabled ? '#9ca3af' : '#2563eb',
              border: 'none',
              cursor: loading || disabled ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={e => {
              if (!loading && !disabled) e.currentTarget.style.backgroundColor = '#1d4ed8';
            }}
            onMouseOut={e => {
              if (!loading && !disabled) e.currentTarget.style.backgroundColor = '#2563eb';
            }}
          >
            {loading ? 'Loading...' : 'Connect Wallet'}
          </button>
        </div>

        {session?.namespaces && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '9999px',
                backgroundColor: '#10b981'
              }}></div>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#4b5563'
              }}>Connected</span>
            </div>

            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <button
                  onClick={getAccount}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={e => {
                    if (!loading) e.currentTarget.style.backgroundColor = '#d1d5db';
                  }}
                  onMouseOut={e => {
                    if (!loading) e.currentTarget.style.backgroundColor = '#e5e7eb';
                  }}
                >
                  Get Account
                </button>
                {account && (
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.375rem',
                    marginTop: '0.5rem',
                    wordBreak: 'break-all',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    color: '#1f2937'
                  }}>
                    {account}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <button
                  onClick={getAccountBalance}
                  disabled={loading || !account}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: loading || !account ? '#e5e7eb' : '#e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: loading || !account ? '#9ca3af' : '#374151',
                    border: 'none',
                    cursor: loading || !account ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    opacity: loading || !account ? 0.5 : 1
                  }}
                  onMouseOver={e => {
                    if (!loading && account) e.currentTarget.style.backgroundColor = '#d1d5db';
                  }}
                  onMouseOut={e => {
                    if (!loading && account) e.currentTarget.style.backgroundColor = '#e5e7eb';
                  }}
                >
                  Get Balance
                </button>
                {balance && (
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.375rem',
                    marginTop: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#1f2937'
                  }}>
                    {balance} ETH
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={getChainId}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={e => {
                    if (!loading) e.currentTarget.style.backgroundColor = '#d1d5db';
                  }}
                  onMouseOut={e => {
                    if (!loading) e.currentTarget.style.backgroundColor = '#e5e7eb';
                  }}
                >
                  Get Chain ID
                </button>
                {chainId && (
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.375rem',
                    marginTop: '0.5rem',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    color: '#1f2937'
                  }}>
                    {chainId}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <WalletConnectModalSign
        projectId={projectId}
        metadata={{
          name: "My Dapp",
          description: "My Dapp description",
          url: "https://my-dapp.com",
          icons: ["https://my-dapp.com/logo.png"],
        }}
      />
    </div>
  );
}