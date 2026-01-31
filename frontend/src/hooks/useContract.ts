import { useWriteContract, useWaitForTransactionReceipt, useAccount, useSignMessage as useWagmiSignMessage } from 'wagmi';
import { parseAbi, type Address } from 'viem';
import { contractAddresses } from '../config/chain';

// EventRegistry ABI
const eventRegistryABI = parseAbi([
  'function checkIn(uint256 eventId)',
]);

export function useCheckIn() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const checkIn = async (eventId: number) => {
    if (!address) throw new Error('Wallet not connected');

    try {
      await writeContract({
        address: contractAddresses.eventRegistry as Address,
        abi: eventRegistryABI,
        functionName: 'checkIn',
        args: [BigInt(eventId)],
      });
    } catch (err) {
      console.error('Check-in error:', err);
      throw err;
    }
  };

  return {
    checkIn,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useSignMessage() {
  const { address } = useAccount();
  const { signMessageAsync } = useWagmiSignMessage();

  const signCheckInMessage = async (eventId: number, email: string) => {
    if (!address) throw new Error('Wallet not connected');

    const message = `0G ProofPass Check-In\n\nEvent ID: ${eventId}\nEmail: ${email}\nWallet: ${address}\n\nThis signature proves you own this wallet and are checking in to the event.`;

    try {
      const signature = await signMessageAsync({ message });
      return signature;
    } catch (err) {
      console.error('Sign message error:', err);
      throw err;
    }
  };

  return { signCheckInMessage };
}

