import { catena } from "@creatachain/cat3";

export const getCat3instance = () => {
  const nodeUrl = import.meta.env.VITE_CATENA_TEST_NODE_URL;
  const provider = new catena.JsonRpcProvider(nodeUrl);
  return provider
};
