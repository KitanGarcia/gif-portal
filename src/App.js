import React, { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

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
      setGifList(...gifList, inputValue);
      setInputValue("");
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

  const renderConnectedContainer = () => (
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
        {gifList.map((gif) => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  );

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
      // Call Solana program here...

      // Set state
      setGifList(TEST_GIFS);
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
