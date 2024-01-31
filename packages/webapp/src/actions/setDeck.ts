import { defaultErrorHandling } from "src/actions/errors"
import { contractWriteThrowing } from "src/actions/libContractWrite"
import { Address } from "src/chain"
import { deployment } from "src/deployment"
import { inventoryABI } from "src/generated"
import { checkFresh, freshWrap } from "src/store/checkFresh"
import { getOpponentIndex } from "src/store/read"

// =================================================================================================

export type SaveArgs = {
  deck: Deck
  playerAddress: Address
  setLoading: (label: string | null) => void
  onSuccess: () => void
}

export type ModifyArgs = {
  deck: Deck
  playerAddress: Address
  index: number
  setLoading: (label: string | null) => void
  onSuccess: () => void
}

// -------------------------------------------------------------------------------------------------

/**
 * Saves a deck created by the player by sending the `saveDeck` transaction.
 *
 * Returns `true` iff the transaction is succesful.
 */
export async function save(args: SaveArgs): Promise<boolean> {
  try {
    return await saveImpl(args)
  } catch (err) {
    args.setLoading(null)
    return defaultErrorHandling("save", err)
  }
}

export async function modify(args: ModifyArgs): Promise<boolean> {
  try {
    return await modifyImpl(args)
  } catch (err) {
    args.setLoading(null)
    return defaultErrorHandling("modify", err)
  }
}

// -------------------------------------------------------------------------------------------------

async function saveImpl(args: SaveArgs): Promise<boolean> {
  args.deck.cards = args.deck.cards.map(card => card.id)
  //console.log(args)
  checkFresh(await freshWrap(
    contractWriteThrowing({
      contract: deployment.Inventory,
      abi: inventoryABI,
      functionName: "addDeck",
      args: [
        args.playerAddress,
        args.deck
      ],
      setLoading: args.setLoading
    })))

  args.onSuccess()
  return true
}

async function modifyImpl(args: ModifyArgs): Promise<boolean> {
  args.deck.cards = args.deck.cards.map(card => card.id)
  //console.log(args)
  checkFresh(await freshWrap(
    contractWriteThrowing({
      contract: deployment.Inventory,
      abi: inventoryABI,
      functionName: "modifyDeck",
      args: [
        args.playerAddress,
        args.index,
        args.deck
      ],
      setLoading: args.setLoading
    })))

  args.onSuccess()
  return true
}


// =================================================================================================