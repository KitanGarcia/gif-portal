import React, { useEffect, useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import IDL from "./idl";
import kp from "./keypair";

const { SystemProgram, Keypair } = web3;
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);
const programID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
const network = clusterApiUrl("devnet");

// Receive confirmation that txn succeeded after just one node acknowledges the txn
// Finalized would mean that the whole blockchain would acknowledge it
const opts = {
  preflightCommitment: "processed",
};

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = [
  "https://imgs.search.brave.com/hZuSHh7HRUdx1xCOEV0rdNE4nmuyHsXRRA74hxPOH4w/rs:fit:350:308:1/g:ce/aHR0cHM6Ly82OC5t/ZWRpYS50dW1ibHIu/Y29tL2RhMzkwMjhm/NzE0MTRjZjgwOGQ2/ODRiMDE4OTExM2M0/L3R1bWJscl9uZHRh/ZHZCWnIzMXRlNXJ1/c28xXzQwMC5naWY.gif",
  "https://imgs.search.brave.com/bprsaq_OCGub754wsIaoqnW1TiMgSbSi5nHj4-qNvy4/rs:fit:499:260:1/g:ce/aHR0cHM6Ly82Ni5t/ZWRpYS50dW1ibHIu/Y29tLzRmYmFjMzg5/OWVkMDUwMTQ2MWI4/MzIwMWY5ZTJkYThl/L3R1bWJscl9tamNy/Y2pRTlU5MXJ3eTIx/cG8xXzUwMC5naWY.gif",
  "https://media0.giphy.com/media/m171D9eM7Jq6s/200.gif",
  "https://media1.giphy.com/media/P9KgGibY0sKwf8Q3WI/200.gif",
];

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGifList] = useState([]);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const getProgram = async () => {
    // Get metadata of Solana program
    const idl = await Program.fetchIdl(programID, getProvider());
    console.log("GOT IDL: ", IDL);

    // Create program that we can call
    const program = new Program(idl, programID, getProvider());
    console.log("GOT PROGRAM: ", program);
    return program;
  };

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = await getProgram();

      console.log("CREATING ACCOUNT");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });

      console.log(
        "Created a new baseAccount w/ address: ",
        baseAccount.publicKey.toString()
      );
      await getGifList();
    } catch (error) {
      console.log("Error creating BaseAccount account: ", error);
    }
  };

  const getGifList = async () => {
    try {
      console.log("HERE! LINE 78!");
      const program = await getProgram();
      console.log("PROGRAM! LINE 79!");
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("Got the account: ", account);
      setGifList(account.gifList);
    } catch (error) {
      console.log("Error in getGifList: ", error);
      setGifList(null);
    }
  };

  const checkIfWalletIsConnected = async () => {
    if (window?.solana?.isPhantom) {
      console.log("Phantom wallet found!");

      // Connects to Phantom wallet (automatically after the first time)
      const response = await window.solana.connect({ onlyIfTrusted: true });
      console.log("Connected with Public Key", response.publicKey.toString());

      setWalletAddress(response.publicKey.toString());
    } else {
      alert("Solana object not found. Get a Phantom wallet.");
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log("Connected with Public Key: ", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log("Gif link: ", inputValue);
      setInputValue("");
      try {
        const provider = getProvider();
        const program = await getProgram();
        await program.rpc.addGif(inputValue, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
          },
        });
        console.log("Gif successfully sent to program: ", inputValue);
        await getGifList();
      } catch (error) {}
    } else {
      console.log("Empty input. Try again.");
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => {
    // Program account has not yet been initialized
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGifAccount}
          >
            Do One-Time Initialization for GIF Program Account
          </button>
        </div>
      );
    }

    return (
      <div className="connected-container">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendGif();
          }}
        >
          <input
            type="text"
            placeholder="Enter GIF link"
            value={inputValue}
            onChange={onInputChange}
          />
          <button type="submit" className="cta-button submit-gif-button">
            Submit
          </button>
        </form>
        <div className="gif-grid">
          {gifList.map((item, index) => (
            <div className="gif-item" key={index}>
              <img src={item.gifLink} alt={item.gifLink} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");
      getGifList();
    }
  }, [walletAddress]);

  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">🖼Animal GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
