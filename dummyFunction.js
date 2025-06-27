const response = await request({
  topic: session?.topic,
  chainId: "eip155:1",
  request: {
    id: 1,
    jsonrpc: "2.0",
    method: "personal_sign",
    params: [
      {
        from: "0x1456225dE90927193F7A171E64a600416f96f2C8",
        to: "0x1456225dE90927193F7A171E64a600416f96f2C8",
        data: "0x",
        nonce: "0x00",
        gasPrice: "0xbb5e",
        gas: "0x5208",
        value: "0x00",
        amount: "23",
        symbol: "Usdt",
      },
    ],
  },
});
