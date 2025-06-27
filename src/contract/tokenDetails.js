import { abi } from "./abi";
import { catena } from "@creatachain/cat3";
import { getCat3instance } from "./getCat3Instance";

const catenaProvider = getCat3instance();
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export const getTokenDetails = async (userFromAddress) => {
  const ABI = abi;

  try {
    const tokenContract = new catena.Contract(
      contractAddress,
      ABI,
      catenaProvider
    );
    const decimals = Number(await tokenContract.decimals());
    const symbol = await tokenContract.symbol(); 
    const balance = await tokenContract.balanceOf(userFromAddress);
    const formatedBalance = Number(balance) / Math.pow(10, decimals);
    return { decimals, symbol, balance: formatedBalance };
  } catch (error) {
    console.log(error);
  }
};

 