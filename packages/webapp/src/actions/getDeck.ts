import { defaultErrorHandling } from "src/actions/errors"
import { contractWriteThrowing } from "src/actions/libContractWrite"
import { Address } from "src/chain"
import { deployment } from "src/deployment"
import { inventoryABI } from "src/generated"
import { checkFresh, freshWrap } from "src/store/checkFresh"
import { getOpponentIndex } from "src/store/read"

// =================================================================================================

export type getDeckArgs = {
  index: number
  playerAddress: Address
  setLoading: (label: string | null) => void
  onSuccess: () => void
}

export type getNumDecksArgs = {
  playerAddress: Address
  setLoading: (label: string | null) => void
  onSuccess: () => void
}

export type getAllDeckNamesAndIdsArgs = {
  playerAddress: Address
  setLoading: (label: string | null) => void
  onSuccess: () => void
}

export type getAllDecksArgs = {
  playerAddress: Address
  setLoading: (label: string | null) => void
  onSuccess: () => void
}

export async function getDeck(args: getDeckArgs): Promise<boolean> {
  try {
    return await getDeckImpl(args)
  } catch (err) {
    args.setLoading(null)
    return defaultErrorHandling("getDeckReal", err)
  }
}

export async function getNumDecks(args: getDeckCountArgs): Promise<boolean> {
  try {
    return await getNumDecksImpl(args)
  } catch (err) {
    args.setLoading(null)
    return defaultErrorHandling("getNumDecks", err)
  }
}

export async function getAllDeckNamesAndIds(args: getAllDeckNamesAndIdsArgs): Promise<boolean> {
  try {
    return await getAllDeckNamesAndIdsImpl(args)
  } catch (err) {
    args.setLoading(null)
    return defaultErrorHandling("getAllDeckNamesAndIds", err)
  }
}

export async function getAllDecks(args: getAllDecksArgs): Promise<boolean> {
  try {
    return await getAllDecksImpl(args)
  } catch (err) {
    args.setLoading(null)
    return defaultErrorHandling("getAllDecks", err)
  }
}


// -------------------------------------------------------------------------------------------------

async function getDeckImpl(args: getDeckArgs): Promise<any> {
  const deckData = await contractWriteThrowing({
    contract: deployment.Inventory,
    abi: inventoryABI,
    functionName: "getDeckReal",
    args: [
      args.playerAddress,
      args.index
    ],
    setLoading: args.setLoading
  })

  checkFresh(await freshWrap(deckData))

  args.onSuccess()
  return deckData
}

async function getNumDecksImpl(args: getNumDecksArgs): Promise<any> {
  const deckData = await contractWriteThrowing({
    contract: deployment.Inventory,
    abi: inventoryABI,
    functionName: "getNumDecks",
    args: [
      args.playerAddress,
    ],
    setLoading: args.setLoading
  })

  checkFresh(await freshWrap(deckData))

  args.onSuccess()
  return deckData
}

async function getAllDeckNamesAndIdsImpl(args: getAllDeckNamesAndIdsArgs): Promise<any> {
  const namesAndIds = await contractWriteThrowing({
    contract: deployment.Inventory,
    abi: inventoryABI,
    functionName: "getAllDeckNamesAndIds",
    args: [
      args.playerAddress,
    ],
    setLoading: args.setLoading
  })

  checkFresh(await freshWrap(namesAndIds))

  args.onSuccess()
  return namesAndIds
}

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