import { defaultErrorHandling } from "src/actions/errors"
import { contractWriteThrowing } from "src/actions/libContractWrite"
import { Address } from "src/chain"
import { deployment } from "src/deployment"
import { inventoryABI } from "src/generated"
import { checkFresh, freshWrap } from "src/store/checkFresh"

// =================================================================================================

export type getAllDecksArgs = {
  playerAddress: Address
  setLoading: (label: string | null) => void
  onSuccess: () => void
}

// -------------------------------------------------------------------------------------------------

/**
 * Fetches all decks of the given player by sending the `getAllDecks` transaction.
 *
 * Returns `true` iff the transaction is succesful.
 */
export async function getAllDecks(args: getAllDecksArgs): Promise<boolean> {
  try {
    return await getAllDecksImpl(args)
  } catch (err) {
    args.setLoading(null)
    return defaultErrorHandling("getAllDecks", err)
  }
}

// -------------------------------------------------------------------------------------------------

async function getAllDecksImpl(args: getAllDecksArgs): Promise<any> {
  const decks = await contractWriteThrowing({
    contract: deployment.Inventory,
    abi: inventoryABI,
    functionName: "getAllDecks",
    args: [
      args.playerAddress,
    ],
    setLoading: args.setLoading
  })

  checkFresh(await freshWrap(decks))

  args.onSuccess()
  return decks
}

// =================================================================================================