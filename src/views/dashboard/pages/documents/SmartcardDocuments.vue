<template>
  <v-container>
     <v-dialog
      v-model="isHash"
      hide-overlay
      persistent
      width="375"
      class="modal-loading"
    >
      <v-card
        color="blue-berry accent-4"
        dark
        class="modal-card-loading"
      >
        <v-card-text class="text-center text-modal-loading">
          Please Wait, document is uploading
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0 mt-4"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
        transition="dialog-top-transition"
        max-width="375"
         v-model="isUpload"
      >
        <template>
          <v-card color="blue-berry accent-4">
            <v-card-text class="text-center text-modal-loading pt-10">
              The document has been uploaded successfully!
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn
                text
                @click="isUpload = false"
                class="pink"
                color="white"
              >Ok</v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
    <v-row>
      <!-- <v-col xs="4" sm="4">
      </v-col> -->
      <v-col>
        <v-card>
          <v-list-item>
            <v-list-item-title class="text-h6 mb-1">
              Balances
            </v-list-item-title>
          </v-list-item>
          <v-card-text>
            <v-row>
              <v-col xs="3" sm="3" offset-sm="2">
                <v-row>
                  <v-col xs="2" sm="2" class="ml-1">
                    <v-img 
                    :src="require('../../../../assets/wallet-solid.svg')" 
                    contain 
                    height="25" />
                  </v-col>
                  <v-col xs="8" sm="8" class="ml-n7">
                     {{ walletEthAdressDisplay }}
                  </v-col>
                </v-row>  
              </v-col>
              <v-col xs="3" sm="3">
                <cryptoicon symbol="usdc" size="24" class="cripto-icon" />
                {{ balances.usdc }}
              </v-col>
              <v-col xs="3" sm="3">
                <cryptoicon symbol="bnb" size="24" class="cripto-icon" />
                {{ balances.bnb }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-progress-linear
          indeterminate
          v-if="loading"
          color="pink"
        ></v-progress-linear>

        <v-card>
          <v-tabs
            background-color="blue-berry accent-4"
            dark
            v-model="tabIndex"
          >
            <v-tab v-for="item in tabitems" :key="item.key">
              {{ item.label }}
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="tabIndex">
            <v-tab-item v-for="item in tabitems" :key="item.key">
              <v-card flat>
                <v-card-text>
                  <v-alert :type="alertType" v-if="alertMessage">{{
                    alertMessage
                  }}</v-alert>

                  <v-row class="justify-center">
                    <v-col xs="6" sm="6">
                      <v-file-input
                        multiple
                        v-if="item.settings.signing !== 'transfer'"
                        show-size
                        chips
                        label="Files"
                        v-model="files"
                      ></v-file-input>
                      <v-file-input
                        multiple
                        v-if="item.settings.signing === 'transfer'"
                        show-size
                        chips
                        :accept="item.settings.signing.contentType"
                        label="PDF Documents"
                        v-model="files"
                      ></v-file-input>
                      <v-alert type="alert" dense v-if="cidindex"
                        >Image URI: {{ cidindex }}</v-alert
                      >
                    </v-col>
                  </v-row>
                  <v-row class="justify-center">
                    <v-col xs="6" sm="6">
                      <v-text-field
                        label="Name"
                        required
                        v-model="name"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="justify-center">
                    <v-col xs="6" sm="6">
                      <v-text-field
                        required
                        label="Description"
                        v-model="description"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row class="justify-center">
                    <v-col xs="6" sm="6" offset="5">
                      <v-btn
                        color="pink"
                        v-if="connected === false"
                        @click="web3Connect"
                        dark
                      >
                        Connect
                      </v-btn>
                      <v-btn
                        :disabled="files.length === 0"
                        v-if="connected"
                        @click="xdvify"
                        color="primary"
                      >
                        Create metadata and mint
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-card>

        <v-card>
          <v-tabs
            background-color="blue-berry accent-4"
            dark
            v-model="tabDetailIndex"
          >
            <v-tab v-for="item in tabDetailItems" :key="item.key">
              {{ item.label }}
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="tabDetailIndex">
            <v-tab-item key="details">
              <v-alert type="success" v-if="txid.length > 0" dense dismissible
                >{{ cids.length }} file(s) has been signed and uploaded</v-alert
              >
              <v-card>
                <v-row dense>
                  <v-col cols="12">
                    <v-card>
                      <v-card-title class="text-h5">
                        Transaction details
                      </v-card-title>

                      <v-card-text v-if="!!cidindex">
                        <div>No transactions</div>
                      </v-card-text>
                      <v-card-text v-if="!!cidindex">
                        <div>Tx {{ txid }}</div>
                        <div>Ancon cid {{ cidindex }}</div>

                        <v-row
                          ><v-col>
                            <v-simple-table dense md="10">
                              <template v-slot:default>
                                <!-- <thead>
                              <tr>
                                <th>CID</th>
                                <th>Content Type</th>
                                <th>Name</th>
                              </tr>
                            </thead> -->
                                <tbody>
                                  <tr
                                    v-for="item in reportVerify"
                                    :key="item.title"
                                  >
                                    <td>
                                      {{ item.title }}
                                    </td>
                                    <td>
                                      {{ item.subtitle }}
                                    </td>
                                    <td>
                                      {{ item.name }}
                                    </td>
                                  </tr>
                                </tbody>
                              </template>
                            </v-simple-table>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col>
                            <v-simple-table dense md="10">
                              <template v-slot:default>
                                <thead>
                                  <tr>
                                    <th>CID</th>
                                    <th>Content Type</th>
                                    <th>Name</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr
                                    v-for="item in viewItems.signedFiles"
                                    :key="item.cid"
                                  >
                                    <td>
                                      {{ item.cid }}
                                    </td>
                                    <td>
                                      {{ item.contentType }}
                                    </td>
                                    <td>
                                      {{ item.name }}
                                    </td>
                                    <td>
                                      <v-btn
                                        v-show="false"
                                        @click="
                                          loadCid(
                                            item.cid,
                                            viewItems.type,
                                            item.name,
                                            item.contentType
                                          )
                                        "
                                        ><v-icon right dark>
                                          mdi-download
                                        </v-icon>
                                        Download</v-btn
                                      >
                                    </td>
                                  </tr>
                                </tbody>
                              </template>
                            </v-simple-table>
                          </v-col>
                        </v-row>
                      </v-card-text>

                      <v-card-actions v-if="!!cidindex">
                        <v-btn @click="shareTo(cidindex)" text
                          ><v-icon right dark> mdi-link </v-icon> Share
                        </v-btn>
                        <v-btn
                          @click="verifyChain(cidindex)"
                          text
                          v-if="viewItems.type === 'jwt'"
                        >
                          <v-icon right dark> mdi-certificate </v-icon> Verify
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </v-tab-item>
            <v-tab-item key="transactions">
              <v-alert type="success" v-if="txid.length > 0" dense dismissible
                >{{ cids.length }} file(s) has been signed and uploaded</v-alert
              >
              <v-card>
                <v-row dense>
                  <v-col cols="12">
                    <v-card>
                      <v-card-title class="text-h5">
                        Transactions
                      </v-card-title>

                      <v-card-text>
                        <v-simple-table dense>
                          <template v-slot:default>
                            <thead>
                              <tr>
                                <th class="text-left">Tx</th>
                                <th class="text-left">Event</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="item in transactions" :key="item">
                                <td>{{ item.transactionHash }}</td>
                                <td>{{ item.event }}</td>
                              </tr>
                            </tbody>
                          </template>
                        </v-simple-table>
                      </v-card-text>
                      <v-card-actions>
                        <!-- <v-btn @click="shareTo" text> Render content </v-btn> -->
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-card>

        <vue-confirm-dialog></vue-confirm-dialog>
        <v-dialog v-model="unlockPin" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="headline">Enter PIN for hardware module</span>
            </v-card-title>

            <v-card-text>
              <v-form autocomplete="off">
                <v-row>
                  <v-col cols="12" md="12">
                    <v-text-field
                      required
                      v-model="pin"
                      :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="showPassword ? 'text' : 'password'"
                      class="input-group--focused"
                      @click:append="showPassword = !showPassword"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="unlockPin = false"
                >Cancel</v-btn
              >
              <v-btn color="blue darken-1" text @click="xdvify">OK</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import "share-api-polyfill";

import { BigNumber, ethers } from "ethers";
import { AnconManager } from "../../../../views/dashboard/pages/wallet/anconManager";
import { AnconWeb3Client } from "../../../../anconjs";
import { SwarmManager } from "../../../../views/dashboard/pages/wallet/SwarmManager";
import { base64 } from "ethers/lib/utils";
import Web3, * as web3 from "web3";
import { TxEvent } from "@cosmjs/tendermint-rpc";
import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";

import {
  MsgMetadata,
  MsgMetadataResponse,
  MsgUpdateMetadataOwnership,
} from "@/anconjs/store/generated/Electronic-Signatures-Industries/ancon-protocol/ElectronicSignaturesIndustries.anconprotocol.anconprotocol/module/types/anconprotocol/tx";
const xdvnftAbi = require("../../../../abi/xdvnft");
const xdvAbi = require("../../../../abi/xdv.json");
import { Web3Provider } from "@ethersproject/providers";
import { AnconWeb3Provider } from "cosmjs-web3provider/anconProvider";

@Component({
  components: {},
})

export default class SmartcardDocuments extends Vue {
  files: File[] = [];
  canUpload: boolean = false;
  loading: boolean = false;
  pin = "";
  hash: any = '';
  showPassword = false;
  uploadStatus = false;
  typelink = { mode: "3" };
  unlockPin = false;
  isHash = false;
  isUpload = false;
  ancon: AnconManager;
  swarm: SwarmManager;
  report: unknown = {};
  cids: any = [];
  manifest: any = "";
  items: any = [];
  did = "";
  reportVerify = [];
  alertMessage = "";
  fab = false;
  selected = [0];
  cid = {};
  search = {};
  searchInput = null;
  reports = [];
  currentAccount: any;
  web3: ethers.providers.Web3Provider;
  contract: any;
  daiContract: any;
  ethersContract: any;
  ethersInstance: ethers.providers.Web3Provider;
  anchorContract: ethers.Contract;
  result: void;
  txid: any = "";
  balances = {
    bnb: "0",
    usdc: "0",
    daiMock: "0",
  };
  connected = false;
  cidindex = "";
  DAIAddress: string = `0x59b0e313070138127dc91F9F357Ba989FE5D57F8`;
  tabIndex = null;
  tabitems = [
    {
      key: "mint",
      label: "Mint NFT",
      settings: {
        signing: "simple",
        contentType: null,
      },
    },
  ];

  tabDetailIndex = null;
  tabDetailItems = [
    {
      key: "details",
      label: "Details",
      settings: {
        signing: "details",
        contentType: null,
      },
    },
    {
      key: "transactions",
      label: "Transactions",
      settings: {
        signing: "transactions",
        contentType: null,
      },
    },
  ];
  name = "My New Fancy NFT";
  description = "Powered by Ancon Protocol";
  viewItems = [];
  transactions = [];
  emulateSmartcard = false;
  //wallet: Wallet;
  web3instance: Web3;
  nftWeb3Contract: any;
  daiWeb3contract: any;
  anconWeb3client: AnconWeb3Provider;
  onboard = null;
  chainId: number;
  web3storageAPIKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDE0ZDM0NDExYTYyQkJjMjBEMzkzZDNjN2RhQUE4YzZEMGRmNDY2NjAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2MzUwMTU4NTUyNTIsIm5hbWUiOiJBbmNvbiJ9.TiAmVFS000shN0L9cV3q2SWsJhVW0uxM0ZCEbzTe9QI";
  nftAPIKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDlFNWJFMjI2YUU4NzhFZkJGZGU1NzhDM0VkMmY2NDhGMjEzMDBmOGMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzNTAxNTU4Mzg2OSwibmFtZSI6ImFuY29uIn0.3VIRmGQ3IIfwk4X30NPDSfX8SN3YdFGnPqsYDc-7jlY";
  walletEthAdress = "";
  walletEthAdressDisplay = "Not connected";
  walletCosmosAddress = "";
  walletCosmosAddressDisplay = "Not connected";
  sideBarItems = {
    selectedItem: 0,
    items: [
      { text: "Mint", icon: "mdi-checkerboard-plus" },
      { text: "Transfer", icon: "mdi-bank-transfer" },
      { text: "Crosschain", icon: "mdi-transit-connection-horizontal" },
    ],
  };

  async loadTransactions() {
    if (this.ethersContract) {
      const query = this.ethersContract.filters.Transfer(this.currentAccount);
      this.transactions = [
        ...(await this.ethersContract.queryFilter(query)),
        this.transactions,
      ];
    }

    if (this.anchorContract) {
      const query = this.anchorContract.filters.DocumentAnchored();
      this.transactions = [
        ...(await this.anchorContract.queryFilter(query)),
        this.transactions,
      ];
    }
  }

  /**
   * Downloads a File object
   */
  async downloadFileFromObject(o: any, name: string) {
    try {
      const url = window.URL.createObjectURL(new Blob([o]));
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
      a.click();
      a.remove();
    } catch (e) {
      throw new Error("No se pudo convertir el archivo");
    }
  }

  /**
   * Loads v-show="false" a cid
   */
  async loadCid(cid: string, type: string) {
    if (this.typelink.mode === "3") {
      //return await this.ipfs.getObject(cid);
    } else {
      // none
    }
    const result = await this.ancon.getObject(cid);

    // if (blob.content === null) {
    //   //TODO: download all sources
    //   //TODO: parse json and make every object clickable
    //   console.log(blob);
    // }

    // await this.downloadFileFromObject(
    //   blob.buffer,
    //   result.value.name,
    //   result.value.contentType
    // );
  }

  openCid(cid: string) {
    const href = `https://explore.ipld.io/#/explore/${cid}`;
    window.open(
      href,
      "_blank",
      "top=500,left=100,frame=false,nodeIntegration=no,menubar=yes"
    );
  }

  async web3ConnectEth() {
    //@ts-ignore
      const accounts = await window.ethereum.enable();
      this.web3instance = new Web3(window.ethereum);
      //@ts-ignore
      const provider = new ethers.providers.Web3Provider(
        this.web3instance.currentProvider
      );
      this.anconWeb3client = new AnconWeb3Provider(
      "https://ancon.did.pa/evm",
      "ancon",
      "anconprotocol_9000-1",
      9000,
      new ethers.providers.Web3Provider(window.ethereum),
      accounts[0] as string
    );
      //debugger

      this.walletEthAdress = this.anconWeb3client.web3defaultAccount;

      this.walletEthAdressDisplay = "";

    //Getting first 7 chars & concat into displayed string
    for (let i = 0; i < 7; i++) {
      this.walletEthAdressDisplay += this.walletEthAdress[i];
    }

    this.walletEthAdressDisplay += "...";

    //Getting last 6 chars & concat into displayed string
    for (
      let i = this.walletEthAdress.length - 6;
      i < this.walletEthAdress.length;
      i++
    ) {
      this.walletEthAdressDisplay += this.walletEthAdress[i];
    }
  }

  async getCreatBatchId() {
      this.swarm = new SwarmManager();
      const hashObse = await this.swarm.createPostageStamp(this.files[0]);
      this.isHash = true;
      hashObse.subscribe((value: any) => {
        const getHashSwarm = async () => {
          const { _hash, _multiHash} = value;
            if(_hash) {
              const intervalHashId = localStorage.getItem('intervalHashId');
               clearInterval(parseInt(intervalHashId));
               this.hash = _multiHash;
               await this.swarm.getFile(_hash);
               this.isHash = false;
               this.isUpload = true;
               localStorage.removeItem('intervalHashId')
            }
        }
        getHashSwarm();
      });
  }

  async getHashFile() {
    this.swarm = new SwarmManager();
    const { hash, multiHash } = await this.swarm.createHashFile((Vue as any).appconfig.BATCHID, this.files[0]);
    this.isHash = true;
    if (hash) {
      this.hash = multiHash;
      await this.swarm.getFile(hash);
      this.isHash = false;
      this.isUpload = true;
    } 
  }

  async web3Connect() {
    if (this.typelink.mode !== "3") {
       // @ts-ignore
      this.$confirm({
        auth: true,
        message: "Please enter a 24 seed passphrase",
        button: {
          yes: "Yes",
          no: "Cancel",
        },
        /**
         * Callback Function
         * @param {Boolean} confirm
         * @param {String} password
         */
        callback: async (confirm, password) => {
          if (confirm && password) {
            await this.connect(password);
          }
        },
      });
    } else {
      (Vue as any).appconfig.CREATE_POSTAGE_BATCH_ENABLE ? this.getCreatBatchId() : this.getHashFile();
    }
  }

  async connect(passphrase: string) {
    //@ts-ignore
    const accounts = await window.ethereum.enable();

    this.web3instance = new Web3(window.ethereum);
    //@ts-ignore
    const provider = new ethers.providers.Web3Provider(
      this.web3instance.currentProvider
    );
    // this.anconWeb3client = new AnconWeb3Client(
    //   "https://ancon.did.pa/evm",
    //   provider,
    //   accounts[0] as string
    // );

    this.anconWeb3client = new AnconWeb3Provider(
      "https://ancon.did.pa/evm",
      "ancon",
      "anconprotocol_9000-1",
      9000,
      new ethers.providers.Web3Provider(window.ethereum),
      accounts[0] as string
    );
    //debugger

    this.walletEthAdress = this.anconWeb3client.web3defaultAccount;

    this.walletEthAdressDisplay = "";

    //Getting first 7 chars & concat into displayed string
    for (let i = 0; i < 7; i++) {
      this.walletEthAdressDisplay += this.walletEthAdress[i];
    }

    this.walletEthAdressDisplay += "...";

    //Getting last 6 chars & concat into displayed string
    for (
      let i = this.walletEthAdress.length - 6;
      i < this.walletEthAdress.length;
      i++
    ) {
      this.walletEthAdressDisplay += this.walletEthAdress[i];
    }

    this.currentAccount = accounts[0];
    // DAI
    this.daiWeb3contract = new this.web3instance.eth.Contract(
      xdvnftAbi.DAI.raw.abi,
      //"0x00FBe0ce907a1ff5EF386F4e0368697aF5885bDA"
      "0xDF21F97c4bE43BDa7379D0Bab92C0b5788feE343"
    );

    // XDVNFT
    this.nftWeb3Contract = new this.web3instance.eth.Contract(
      xdvnftAbi.XDVNFT.raw.abi,
      //"0xb0c578D19f6E7dD455798b76CC92FfdDb61aD635"
      "0x1f8492d8411712C24DdF511a6447A3B81Ac79eEe"
    );

    try {
      //await this.anconWeb3client.connect();
      await this.anconWeb3client.connectProvider();
      this.connected = true;

      this.walletCosmosAddress = this.anconWeb3client.cosmosAccount.address;

      this.walletCosmosAddressDisplay = "";

      //Getting first 7 chars & concat into displayed string
      for (let i = 0; i < 7; i++) {
        this.walletCosmosAddressDisplay += this.walletCosmosAddress[i];
      }

      this.walletCosmosAddressDisplay += "...";

      //Getting last 6 chars & concat into displayed string
      for (
        let i = this.walletEthAdress.length - 6;
        i < this.walletEthAdress.length;
        i++
      ) {
        this.walletCosmosAddressDisplay += this.walletCosmosAddress[i];
      }
      //debugger;

      this.subscribeToMetadataEvents();
      await this.loadBalances();
      await this.loadTransactions();
    } catch (e) {
      alert(e.message);
    }
  }

  async loadBalances() {
    setInterval(async () => {
      const [usdc] = await this.daiWeb3contract.methods.balanceOf(
        this.currentAccount
      );

      const bnb = await this.web3instance.eth.getBalance(this.currentAccount);

      this.balances.bnb = ethers.utils.formatEther(bnb);
      this.balances.usdc = ethers.utils.formatEther(usdc);
    }, 1250);
  }

  async shareTo(cid) {
    const url = `${location.href}link/${cid}`;

    // @ts-ignore
    navigator.share(
      {
        title: "XDV",
        text: "Sharing this signed document that you requested",
        url,
      },
      // @ts-ignore
      {
        // @ts-ignore
        copy: true,
        email: true,
        print: true,
        sms: true,
        smessenger: true,
        // @ts-ignore
        facebook: true,
        whatsapp: true,
        twitter: true,
        linkedin: true,
        telegram: true,
        skype: true,
      }
    );
  }

  // Stores documents and NFT
  async xdvify() {
    let lnk;
    // simple
    const storage = new Web3Storage({
      token: this.web3storageAPIKey,
    });

    this.loading = true;

    debugger;
    // 1. Upload files - web3.storage
    const cid = await storage.put(this.files, { wrapWithDirectory: true });
    debugger;
    // 2. Create Metadata
    await this.createMetadata(cid, this.name, this.description);

    // 3. Mint  NFT
  }

  async initiateCrossNFTOwnership(res) {
    const proof = await this.updateMetadata(res);
    // await this.relayMessage(proof);
    // await this.initiateCrossNFTOwnership();
  }

  async mounted() {
    this.web3ConnectEth();
    if (this.$router.currentRoute.params.cid) {
      this.cidindex = this.$router.currentRoute.params.cid || "";
      await this.loadViewer();
    }
    await this.loadTransactions();
  }

  /** Subscribes to events
   *
   */
  subscribeToMetadataEvents() {
    const query = `message.action='Metadata'`;
    const c = this.anconWeb3client.tm.subscribeTx(query);
    const listener = {
      next: async (log: TxEvent) => {
        // Decode response
        const res = MsgMetadataResponse.decode(log.result.data);
        console.log(res);
        // Hack: Protobuf issue
        const cid = res.cid.split(";")[1];
        console.log(cid);

        // Get CID content from GET /ancon/{cid} or /ancon/{cid}/{path}
        const content =
          await this.anconWeb3client.queryClient.queryReadWithPath(
            cid,
            "/",
            {}
          );

        console.log(content.data);

        this.result = await this.mintNft(cid);
        //  await this.initiateCrossNFTOwnership(res);

        this.cidindex = cid;
        await this.loadViewer();
        await this.loadTransactions();
        this.loading = false;
        c.removeListener(listener);
      },
    };
    c.addListener(listener);
  }

  /** Subscribes to events */
  subscribeToUpdateMetadataEvents() {
    return new Promise((resolve, reject) => {
      const query = `message.action='UpdateMetadataOwnership'`;
      const c = this.anconWeb3client.tm.subscribeTx(query);

      c.addListener({
        next: async (log: TxEvent) => {
          // Decode response
          const res = MsgUpdateMetadataOwnership.decode(log.result.data);
          console.log(res);
          // Hack: Protobuf issue
          const cid = res.hash.split(";")[1];
          console.log(cid);

          // Get CID content from GET /ancon/{cid} or /ancon/{cid}/{path}
          const content =
            await this.anconWeb3client.queryClient.queryReadWithPath(
              cid,
              "/",
              {}
            );

          console.log(content.data);

          let key = cid;
          const path = "";
          const requestProof = await fetch(
            `http://ancon.did.pa:1317/ancon/proof/${key}${path}`
          );
          const proof = await requestProof.json();

          const root = proof.root;
          const exp = proof.proof;

          console.log(root, exp);
        },
      });
    });
  }

  /** Creates onchain metadata */
  async createMetadata(root, name, description): Promise<any> {
    debugger;
    //did:example:123?service=agent&relativeRef=/credentials#degree
    //did:ethr:9000:tokenaddress?service=erc721&tokenid
    const msg = MsgMetadata.fromPartial({
      creator: this.anconWeb3client.cosmosAccount.address,
      name,
      image: root,
      additionalSources: [],
      links: [],
      owner: `did:ether:9000:${this.currentAccount}`,
      description,
      did: "",
      from: "",
    });

    const evmChainId = 9000;
    // Create Metadata Message request
    // Add Cosmos uatom
    await this.anconWeb3client.signAndBroadcast(
      evmChainId,
      "msgMetadata",
      msg,
      this.cb
    );
  }
  cb({ sig, tx }) {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      this.$confirm({
        auth: false,
        message: `Are you sure you want to sign this transaction?  ${sig.substring(
          0,
          15
        )}...`,
        button: {
          yes: "Yes",
          no: "Cancel",
        },
        /**
         * Callback Function
         * @param {Boolean} confirm
         * @param {String} password
         */
        callback: async (confirm, password) => {
          if (confirm) {
            return resolve(true);
          }

          return reject("User rejected");
        },
      });
    });
  }

  /** Updates metadata ownership*/
  async updateMetadata(metadataCid: string) {
    const msgupd = MsgUpdateMetadataOwnership.fromPartial({
      hash: metadataCid,
      previousOwner: `did:ethr:ancon:${this.web3instance.defaultAccount}`,
      newOwner: "did:ethr:0xeeC58E89996496640c8b5898A7e0218E9b6E90cB",
      currentChainId: "9000", // config / settings
      recipientChainId: "3", // config / settings
      sender: this.anconWeb3client.cosmosAccount.address,

      //tokenaddress: ,
    });

    // Change Metadata Message request
    // Add Cosmos uatom
    const msgUpdateMetadataReceipt =
      await this.anconWeb3client.signAndBroadcast(
        this.chainId,
        "msgUpdateMetadataOwnership",
        msgupd,
        this.cb
      );

    const result = await this.subscribeToUpdateMetadataEvents();
  }

  /** Relays message to chain b, returns bool or revert*/
  async relayMessage() {}

  /** Executes nft ownership claim on chain b */
  async executeNftOwnershipClaim() {}

  async mintNft(uri: string) {
    // anchor to nft
    let gasPrice = ethers.BigNumber.from(22000000000);

    let gasLimit = ethers.BigNumber.from(70000);
    //let gasLimit = await this.daiContract.estimateGas.approve(
    //   this.currentAccount,
    //   this.ethersContract.address
    // );
    // gasLimit = BigNumber.from(gasLimit).add(50000).toBigInt().toString(10);
    // const [allowed] = await this.daiContract.methods.allowance(
    //   this.currentAccount,
    //   this.ethersContract.address
    // );

    //if (!(allowed as BigNumber).eq("1000000000000000000")) {

    const approveTx = await this.daiWeb3contract.methods
      .approve(this.nftWeb3Contract._address, "1000000000000000000")
      .send({
        gasPrice: gasPrice,
        gas: gasLimit,
        from: this.currentAccount,
      });

    // TODO: wait 5 s

    const mintnft = await this.nftWeb3Contract.methods
      .mint(this.currentAccount, uri)
      .send({
        gasPrice: gasPrice,
        gas: gasLimit,
        from: this.currentAccount,
      });

    // gasLimit = await this.ethersContract.estimateGas.mint(
    //   this.currentAccount,
    //   uri
    // );
    // gasLimit = BigNumber.from(gasLimit).add(50000).toBigInt().toString(10);

    // const txmint = await this.ethersContract.methods.mint(
    //   this.currentAccount,
    //   uri,
    //   {
    //     gasPrice,
    //     gasLimit,
    //   }
    // );

    // const log = await txmint.wait(1);
    //
    //this.txid = log.blockHash;

    this.loading = false;
  }

  async loadViewer() {
    if (this.ancon && this.cidindex) {
      const path = "/";
      const body = await fetch(
        `http://ancon.did.pa:1317/ancon/${this.cidindex}${path}`
      );

      const res = await body.json();

      this.viewItems = {
        signedFiles: [
          {
            cid: res.image,
            ...res,
          },
        ],
      } as any;
    }
  }

  async printPdf() {}
}
</script>
