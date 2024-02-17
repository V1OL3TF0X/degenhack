import { FC, useMemo, useState } from 'react'

import { SupportedChainId } from '@azns/resolver-core'
import { useResolveAddressToDomain } from '@azns/resolver-react'
import { InjectedAccount } from '@polkadot/extension-inject/types'
import { encodeAddress } from '@polkadot/util-crypto'
import {
  SubstrateChain,
  SubstrateWalletPlatform,
  alephzero,
  allSubstrateWallets,
  getSubstrateChain,
  isWalletInstalled,
  useBalance,
  useInkathon,
} from '@scio-labs/use-inkathon'
import toast from 'react-hot-toast'

import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import EjectIcon from '@mui/icons-material/Eject';
import { LoadingButton } from '@mui/lab'
import { MenuItem, Button, Tooltip } from '@mui/material'

const truncateHash = (hash: string | undefined, paddingLength = 6): string | undefined => {
  if (!hash?.length) return undefined
  if (hash.length <= paddingLength * 2 + 1) return hash
  return hash.replace(hash.substring(paddingLength, hash.length - paddingLength), '…')
}

const env = {supportedChains: [alephzero.network]};


export interface ConnectButtonProps {}
export const ConnectButton: FC<ConnectButtonProps> = () => {
  const {
    activeChain,
    switchActiveChain,
    connect,
    disconnect,
    isConnecting,
    activeAccount,
    accounts,
    setActiveAccount,
  } = useInkathon()
  const { reducibleBalance, reducibleBalanceFormatted } = useBalance(activeAccount?.address, true, {
    forceUnit: false,
    fixedDecimals: 2,
    removeTrailingZeros: true,
  })
  const [supportedChains] = useState(
    env.supportedChains.map((networkId) => getSubstrateChain(networkId) as SubstrateChain),
  )

  // Sort installed wallets first
  const [browserWallets] = useState([
    ...allSubstrateWallets.filter(
      (w) => w.platforms.includes(SubstrateWalletPlatform.Browser) && isWalletInstalled(w),
    ),
    ...allSubstrateWallets.filter(
      (w) => w.platforms.includes(SubstrateWalletPlatform.Browser) && !isWalletInstalled(w),
    ),
  ])

  // Connect Button
  if (!activeAccount)
    return (
  <>
          <LoadingButton
            className="h-12 min-w-[14rem] gap-2 rounded-2xl border border-white/10 bg-primary px-4 py-3 font-bold text-foreground"
            loading={isConnecting}
            disabled={isConnecting}
            translate="no"
          >
            Connect Wallet
          </LoadingButton>
          {!activeAccount &&
            browserWallets.map((w) =>
              isWalletInstalled(w) ? (
                <MenuItem
                  key={w.id}
                  className="cursor-pointer"
                  onClick={() => {
                    connect?.(undefined, w)
                  }}
                >
                  {w.name}
                </MenuItem>
              ) : (
                <MenuItem key={w.id} className="opacity-50">
                  <Button href={w.urls.website}>
                    <div className="align-center flex justify-start gap-2">
                      <p>{w.name}</p>
                      <OpenInNewIcon />
                    </div>
                    <p>Not installed</p>
                  </Button>
                </MenuItem>
              ),
              )}
              </>
    );

  // Account Menu & Disconnect Button
  return (
    <div className="flex select-none flex-wrap items-stretch justify-center gap-4">
      {/* Account Name, Address, and AZERO.ID-Domain (if assigned) */}
          <Button className="min-w-[14rem] border" translate="no">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col items-center justify-center">
                <AccountName account={activeAccount} />
                <span className="text-xs font-normal">
                  {truncateHash(
                    encodeAddress(activeAccount.address, activeChain?.ss58Prefix || 42),
                    8,
                  )}
                </span>
              </div>
            </div>
          </Button>
          {supportedChains.map((chain) => (
            <MenuItem
              disabled={chain.network === activeChain?.network}
              className={chain.network !== activeChain?.network ? 'cursor-pointer' : ''}
              key={chain.network}
              onClick={async () => {
                await switchActiveChain?.(chain)
                toast.success(`Switched to ${chain.name}`)
              }}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <p>{chain.name}</p>
                {chain.network === activeChain?.network && (
                  <TaskAltIcon className="shrink-0" />
                )}
              </div>
            </MenuItem>
          ))}
          {(accounts || []).map((acc) => {
            const encodedAddress = encodeAddress(acc.address, activeChain?.ss58Prefix || 42)
            const truncatedEncodedAddress = truncateHash(encodedAddress, 10)

            return (
              <MenuItem
                key={encodedAddress}
                disabled={acc.address === activeAccount?.address}
                className={acc.address !== activeAccount?.address ? 'cursor-pointer' : ''}
                onClick={() => {
                  setActiveAccount?.(acc)
                }}
              >
                <div className="flex w-full items-center justify-between">
                  <div>
                    <AccountName account={acc} />
                    <p className="text-xs">{truncatedEncodedAddress}</p>
                  </div>
                  {acc.address === activeAccount?.address && (
                    <TaskAltIcon className="shrink-0"  />
                  )}
                </div>
              </MenuItem>
            )
          })}
          <MenuItem className="cursor-pointer" onClick={() => disconnect?.()}>
            <div className="flex gap-2">
              <EjectIcon />
              Disconnect
            </div>
          </MenuItem>

      {/* Account Balance */}
      {reducibleBalanceFormatted !== undefined && (
        <div className="flex min-w-[10rem] items-center justify-center gap-2 rounded-2xl border bg-gray-900 px-4 py-3 font-mono text-sm font-bold text-foreground">
          {reducibleBalanceFormatted}
          {(!reducibleBalance || reducibleBalance?.isZero()) && (
            <Tooltip title='No balance to pay fees'>
              <ReportGmailerrorredIcon />
            </Tooltip>
          )}
        </div>
      )}
    </div>
  )
}

export interface AccountNameProps {
  account: InjectedAccount
}
export const AccountName: FC<AccountNameProps> = ({ account, ...rest }) => {
  const { activeChain } = useInkathon()
  const doResolveAddress = useMemo(
    () => Object.values(SupportedChainId).includes(activeChain?.network as SupportedChainId),
    [activeChain?.network],
  )
  const { primaryDomain } = useResolveAddressToDomain(
    doResolveAddress ? account?.address : undefined,
    { chainId: activeChain?.network },
  )

  return (
    <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase" {...rest}>
      {primaryDomain || account.name}
      {!!primaryDomain && <span> COKOLWIEK</span>}
    </div>
  )
}