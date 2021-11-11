import { ethToEvmos } from '@hanchon/ethermint-address-converter'
import { createKeplrWallet } from './KeplrWrapper'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import {
  decodeSignature,
  encodeSecp256k1Pubkey,
  encodeSecp256k1Signature,
} from '@cosmjs/amino'
import { Int53 } from '@cosmjs/math'
import {
  ExtendedSecp256k1Signature,
  Secp256k1Signature,
  Secp256k1,
} from '@cosmjs/crypto'
import {
  EncodeObject,
  encodePubkey,
  makeAuthInfoBytes,
  makeSignBytes,
  makeSignDoc,
  Registry,
} from '@cosmjs/proto-signing'
import {
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  SigningStargateClient,
} from '@cosmjs/stargate'
import {
  pubkeyToAddress,
  pubkeyToRawAddress,
  Tendermint34Client,
} from '@cosmjs/tendermint-rpc'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { ethers, Transaction } from 'ethers'
import fetch from 'node-fetch'
import {
  hashPersonalMessage,
  ecrecover,
  ecsign,
  intToBuffer,
  intToHex,
  toRpcSig,
  toCompactSig,
  fromRpcSig,
  pubToAddress,
} from 'ethereumjs-util'
import {
  encoder,
  queryClient,
  registry,
} from './store/generated/Electronic-Signatures-Industries/ancon-protocol/ElectronicSignaturesIndustries.anconprotocol.anconprotocol/module'
import {
  arrayify,
  hexlify,
  joinSignature,
  splitSignature,
} from '@ethersproject/bytes'
import { Interface, keccak256, sha256 } from 'ethers/lib/utils'
import {
  computeAddress,
  serialize,
  UnsignedTransaction,
} from '@ethersproject/transactions'
import Web3 from 'web3'
import key from 'ipfs-core/src/components/key'
import { BroadcastMode, makeStdTx, StdTx } from '@cosmjs/launchpad'
import { LegacyTx } from './store/generated/tharsis/ethermint/ethermint.evm.v1'
import {
  ExtensionOptionsEthereumTx,
  MsgEthereumTx,
} from './store/generated/tharsis/ethermint/ethermint.evm.v1/module/types/ethermint/evm/v1/tx'
import config from './anconConfig'
import { txClient } from 'anconjs/generated/Electronic-Signatures-Industries/ancon-protocol/ElectronicSignaturesIndustries.anconprotocol.anconprotocol/module'

global['fetch'] = require('node-fetch')

export class AnconWeb3Client {
  tm: Tendermint34Client
  msgService: {[k: string]: {[v: string]: (...args) => any}}
  account: any
  connectedSigner: SigningStargateClient
  queryClient: any
  registry: Registry

  apiUrl: string
  rpcUrl: string
  offlineSigner: any
  cosmosChainId: any
  cosmosAccount: any
  pubkey: Uint8Array
  /**
   * New client from mnemonic
   */
  constructor() {
    return this
  }

  async getPublicKey() {
    const key = await window.keplr.getKey(this.cosmosChainId)
    console.log(
      pubkeyToAddress('secp256k1', key.pubKey),
      hexlify(key.address),
      key.bech32Address,
    )

    return key.pubKey
  }

  /**
   * Sign and broadcast
   * @param encoded Message to encode
   * @param fee UI purposes
   * @returns
   */
  async signAndBroadcast(encoded: any, fee: any) {
    const { account } = this.cosmosAccount

    const pubkey = this.cosmosAccount.account.base_account.pub_key

    const txBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: {
        messages: [encoded],
        memo: '',
      },
    } as EncodeObject
    const txBodyBytes = registry.encode(txBodyEncodeObject)
    const gasLimit = Int53.fromString(fee.gas).toNumber()
    const authInfoBytes = makeAuthInfoBytes(
      [
        {
          pubkey,
          sequence: account.base_account.sequence,
        },
      ],
      fee.amount,
      gasLimit,
      1,
    )
    const signDoc = makeSignDoc(
      txBodyBytes,
      authInfoBytes,
      this.cosmosChainId,
      account.base_account.account_number,
    )

    const s = await window.keplr.signDirect(
      this.cosmosChainId,
      this.cosmosAccount.address,
      signDoc,
    )
    const txsignedhex = TxRaw.fromPartial({
      bodyBytes: s.signed.bodyBytes,
      authInfoBytes: s.signed.authInfoBytes,
      signatures: [fromBase64(s.signature.signature)],
    })

    return window.keplr.sendTx(
      this.cosmosChainId,
      TxRaw.encode(txsignedhex).finish(),
      BroadcastMode.Sync,
    )
  }

  async connect(msgclients: Array<{name: string, client: any}>) {
    await window.keplr.enable(config.chainId);
    this.cosmosChainId = config.chainId
    this.rpcUrl = config.rpc
    this.apiUrl = config.rest
    this.tm = await Tendermint34Client.connect(this.rpcUrl)
    // const q = QueryClient.withExtensions(
    //   this.tm,
    //   setupAuthExtension,
    //   setupBankExtension,
    // )

    this.queryClient = await queryClient({
      addr: this.apiUrl,
    })

    this.msgService = {}

    const signer = window.keplr.getOfflineSigner(this.cosmosChainId)
    for (const txcli of msgclients) {
      this.msgService[txcli.name] = await txcli.client(signer, {
        addr: this.rpcUrl,
      })
    }

    const k = await window.keplr.getKey(this.cosmosChainId)
    this.cosmosAccount = {}
    this.cosmosAccount.address = k.bech32Address
    return this
  }

  async getAccountInfo(cosmosAddress: string): Promise<any> {
    const res2 = await (
      await fetch(
        this.apiUrl + `/cosmos/auth/v1beta1/accounts/` + cosmosAddress,
      )
    ).json()

    return { ...res2, address: res2.account.base_account.address }
  }
}
