// Using cat3 library to encode contract data
import { catena } from "@creatachain/cat3";
import { abi } from "./abi.js"; 
import { getCat3instance } from "./getCat3Instance.js";
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

 
const catenaProvider = getCat3instance();

export const transfer = async (data) => { 
  try {
    const { from, to, amount, tokenDecimal } = data; 
    const ABI = abi;
    const iface = new catena.Interface(ABI); 
    // @ts-ignore
    const parsedAmount = catena.parseUnits(amount , tokenDecimal);

    const encodedData = iface.encodeFunctionData("transfer", [
      to,
      parsedAmount,
    ]);

    // Estimate gas for the transaction
    const gasEstimate = await catenaProvider.estimateGas({
      from: from,
      to: contractAddress,
      data: encodedData,
    });
 
    const { gasPrice } = await catenaProvider.getFeeData(); 

    // Create the transaction object
    const params = {
      from: from,
      to: contractAddress,
      data: encodedData,
      amount: 0,
      gas: catena.toBeHex(gasEstimate), // gas and gasPrice are optional (if not provided, it will be estimated by cc extension)
      gasPrice: catena.toBeHex((gasPrice ?? 0).toString()),
    }; 
    // Send the transaction
    const response = await window.creatachain.request({
      method: "sendTransaction",
      params: params,
    });
    // console.log("Transaction Success:", response);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Transaction failed:", error.message);
    } else {
      console.error("Transaction failed:", error);
    }
    throw Error("Transfer error");
  }
};
