import { ConnectKitButton, useModal } from "connectkit"
import { useAccount, useNetwork } from "wagmi"

import { Address, chains } from "src/chain"
import { deployment } from "src/deployment"
import { CreateGameModal } from "src/components/modals/createGameModal"
import { JoinGameModal } from "src/components/modals/joinGameModal"
import { MintDeckModal } from "src/components/modals/mintDeckModal"
import { useGameInGame } from "src/generated"
import { FablePage } from "src/pages/_app"
import { useGameID } from "src/store/hooks"
<<<<<<< HEAD
<<<<<<< HEAD
import { Button } from "src/components/ui/button"
=======
import QueryParamLink from "src/components/queryParamList"
>>>>>>> 4d68b23 (Component wrapping 'Link' added to carry the '?index=' parameter used for testing.)
=======
import Link from "src/components/link"
>>>>>>> f675cc0 (renamed queryParamLink to just link.)

const Home: FablePage = ({ isHydrated }) => {
  const { address } = useAccount()
  const { setOpen } = useModal()
  const { chain: usedChain } = useNetwork()
  const [_gameID, setGameID] = useGameID()

  // Refresh game ID and put it in the store.
  // noinspection JSDeprecatedSymbols
  useGameInGame({
    address: deployment.Game,
    args: [address as Address],
    enabled: !!address,
    onSuccess: (gameID) => {
      // 0 means we're not in a game
      if (gameID !== 0n) setGameID(gameID)
    },
  })

  const chainSupported = chains.some((chain) => chain.id === usedChain?.id)

  // These three states are mutually exclusive. One of them is always true.
  const notConnected = !isHydrated || !address
  const isRightNetwork = !notConnected && chainSupported
  const isWrongNetwork = !notConnected && !chainSupported

  return (
    <main className="flex flex-col min-h-screen items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="font-serif text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          <span className="font-mono font-light text-red-400">0x</span>FABLE
        </h1>

        {notConnected && (
          <div className="">
            <Button variant={"secondary"} className="border-2 border-yellow-500 normal-case hover:scale-105 font-fable text-xl hover:border-yellow-400" onClick={async () => setOpen(true)}>
              Connect Wallet
            </Button>
          </div>
        )}

        {isWrongNetwork && <ConnectKitButton />}

        {isRightNetwork && <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-8">
            <CreateGameModal />
            <JoinGameModal />
            <MintDeckModal />
            <Link className="hover:border-3 btn-lg btn btn-neutral border-2 border-green-900 text-2xl normal-case hover:scale-105 hover:border-green-800" href={"/collection"}>
              Collection →
            </Link>
          </div>  
          <ConnectKitButton />
        </>}
      </div>
    </main>
  )
}

export default Home
