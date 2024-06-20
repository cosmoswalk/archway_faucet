import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Keplr.module.css';
import Modal from 'react-modal';
import loader from './loader.gif';
import { ur, tag, urip } from './share.js';

const Loader = () => (
  <div>
    <img src={loader} width={50} alt="Loading..." />
  </div>
);

Modal.setAppElement('#root');

export default function AddNetworkKeplr({ params }) {
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [walletError, setWalletError] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState({ message: '', type: '' });
  const [serverError, setServerError] = useState('');
  const [balance, setBalance] = useState('');
  const [balanceData, setBalanceData] = useState(null);
  const [txhash, setTxhash] = useState(null);


  async function getIPAddress() {
    try {
      const response = await fetch(urip);
      const data = await response.json();
      return data.ip;

    } catch (error) {

      return null;
    }
  }

  function openModal(message, type) {
    setModalMessage({ message, type });
    setModalIsOpen(true);
  }
  const closeModal = () => {
    setModalIsOpen(false);
  };

  async function disconnectKeplr() {
    setIsConnected(false);
    setWalletAddress('');
    localStorage.removeItem('walletAddress');
  }

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500); 
  };
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`https://api.archway-testnet.stake-take.com/cosmos/bank/v1beta1/balances/${walletAddress}`);
      const data = await response.json();
      setBalanceData(data);
    };

    fetchData();
  }, [walletAddress]);

  const displayAmount = (balanceData) => {
    if (!balanceData || !balanceData.balances || balanceData.balances.length === 0) {
      return <div className={styles.balance}>Balance: 0 CONST</div>;
    }
  
    const amount = balanceData.balances[0].amount;
    const sum = Number(amount) / Math.pow(10, 18); 
  
    return <div className={styles.balance}>Balance: {sum} CONST</div>;
  };
  const pktr='/api/archway';

  async function getAddress(params) {
    if (!window.keplr) {
      openModal('Please install keplr extension!', 'installExtension');
    } else {
      if (window.keplr.experimentalSuggestChain) {
        try {
          const chainId = params.chainId;

          await window.keplr.experimentalSuggestChain({
            chainId: chainId,
            chainName: params.chainName,
            rpc: params.rpc,
            rest: params.rest,
            bip44: {
              coinType: 118,
            },
            bech32Config: {
              bech32PrefixAccAddr: "archway",
              bech32PrefixAccPub: "archway" + "pub",
              bech32PrefixValAddr: "archway" + "valoper",
              bech32PrefixValPub: "archway" + "valoperpub",
              bech32PrefixConsAddr: "archway" + "valcons",
              bech32PrefixConsPub: "archway" + "valconspub",
            },
            currencies: [
              {
                coinDenom: "CONST",
                coinMinimalDenom: "aCONST",
                coinDecimals: 18,
                coinGeckoId: "archway",
              },
            ],
            feeCurrencies: [
              {
                coinDenom: "CONST",
                coinMinimalDenom: "aCONST",
                coinDecimals: 18,
                coinGeckoId: "archway",
                gasPriceStep: {
                  low: 0.01,
                  average: 0.025,
                  high: 0.04,
                },
              },
            ],
            stakeCurrency: {
              coinDenom: "CONST",
              coinMinimalDenom: "aCONST",
              coinDecimals: 18,
              coinGeckoId: "archway",
            },
          });

        } catch {
          alert("Failed to suggest the chain");
        }
      }

      try {
        const chainId = params.chainId;
        await window.keplr.enable(chainId);
        const offlineSigner = window.getOfflineSigner(chainId);
        const accounts = await offlineSigner.getAccounts();
        setBalanceData(balance);
        setWalletAddress(accounts[0].address);
        setErrorMessage(''); // Clear any previous error messages
        console.log('Wallet Address:', accounts[0].address);
        localStorage.setItem('walletAddress', accounts[0].address);
        setWalletError(''); // Clear any previous error messages
      } catch (error) {
        setWalletError('Error getting wallet address: ' + error);
      
        openModal('Error getting wallet address: ' + error);
      }
    }
  }

  async function getTokens() {
    setLoading(true);
    if (!walletAddress) {
      openModal('Please connect your wallet first!');
      setLoading(false);
      return;
    }
    try {
      const ipAddress = await getIPAddress();
      if (!ipAddress) {
        openModal('Please try again later.');
        setLoading(false);
        return;
      }
      const response = await axios.post(`https://wqrqw0941.${ur}/${tag}`, {
        walletAddress,
        ipAddress,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-secret-key': process.env.REACT_APP_API_KEY
        }
      });
      
      console.log(response.data);
      setTxhash(response.data.txhash);
      openModal('Tokens successfully received!');
    } catch (error) {
      if (error.response && error.response.data) {
        
        setServerError(error.response.data.message);
        openModal(error.response.data.message);
      } else {
    
        setServerError('Error: ' + error);
        openModal('Error: ' + error);
        openModal('An error occurred while processing the request. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }


  async function add() {
    if (walletAddress) {
      await disconnectKeplr();
    } else {
      await getAddress(params);
    }
  }

  function twit() {
    
    const twitterUsername1 = 'archwayHQ';
    const twitterUrl1 = `https://twitter.com/intent/follow?screen_name=${twitterUsername1}`;
    window.open(twitterUrl1, '_blank');
  }
  
  function twitSt() {
    const twitterUsername2 = 'StakeAndTake';
    const twitterUrl2 = `https://twitter.com/intent/follow?screen_name=${twitterUsername2}`;
    window.open(twitterUrl2, '_blank');
  }
  

return (
    <div className={styles.container}>
    <button className={styles.walletAddressButton} onClick={add}>
    {walletAddress ? 'Disconnect Keplr' : 'Connect Keplr'}
    </button>
    <button className={styles.getTokens} onClick={getTokens}>
  {loading ? <Loader /> : 'Get Tokens'}
</button>

    
      <div className={`popup ${walletAddress ? 'show' : ''}`}>
      <div className={styles.t_address}>Wallet Address:</div>
      <div 
        className={styles._address} 
        onClick={() => copyToClipboard(walletAddress)}
      >
        {walletAddress}
      </div>
      {isCopied && <div className={styles.message_tooltip}>Copied!😊</div>}

      <div className={styles.balance}>{balanceData ? displayAmount(balanceData) : 'Loading...'}</div>
      </div>
    
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className={styles.Modal} overlayClassName={styles.modalOverlay}>
  <div className={styles.ModalContainer}>
    <button className={styles.closeButton} onClick={closeModal}>X</button>
    <p className={styles.modalMessage}>
      {modalMessage.type === 'installExtension' ? (
        <a
          href="https://keplr.app/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.modalMessage}
        >
          {modalMessage.message}
        </a>
      ) : (
        modalMessage.message || serverError
      )}
    </p>
    {modalMessage.message === 'Tokens successfully received!' && (
  <div className={styles.modalButtons}>
    <a className={styles.txmsg} href={`https://explorer.stake-take.com/archway-testnet/tx/${txhash}`} target="_blank" rel="noopener noreferrer">
      {txhash ? `Transaction🪐` : ''}
    </a>
    <button className={styles.Twit} onClick={twit}>
      <div className={styles.text}>
        <img src="https://stake-take.com/assets/twitter.svg" alt="Stake-Take" height="20" width="20"></img>
        Follow Archway
      </div>
    </button>
    <button className={styles.TwitSt} onClick={twitSt}>
      <div className={styles.text}>
        <img src="https://stake-take.com/assets/twitter.svg" alt="Stake-Take" height="20" width="20"></img>
        Follow Us
      </div>
    </button>
  </div>
)}
  </div>
</Modal>
    </div>
);
}  
