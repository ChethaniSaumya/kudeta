import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Rightbar from './components/Rightbar';
import { Button, useNotification, Loading } from '@web3uikit/core';
import { Twitter, Metamask } from '@web3uikit/icons';
import { TwitterContractAddress } from './config';
import TwitterAbi from './abi/Twitter.json';
import { ethers,utils } from 'ethers';
import Web3Modal from "web3modal";
import { TwitterContractAddress } from './config';
import TwitterAbi from './abi/Twitter.json'
import './App.css';

var toonavatar = require('cartoon-avatar');

function App() {

  let ABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "tweetText",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "tweetImg",
          "type": "string"
        }
      ],
      "name": "addTweet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tweetId",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isDeleted",
          "type": "bool"
        }
      ],
      "name": "deletedTweet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tweetId",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isDeleted",
          "type": "bool"
        }
      ],
      "name": "deleteTweet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "userToFollow",
          "type": "address"
        }
      ],
      "name": "followUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tweetId",
          "type": "uint256"
        }
      ],
      "name": "likeTweet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "content",
          "type": "string"
        }
      ],
      "name": "sendMessage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isDeleted",
          "type": "bool"
        }
      ],
      "name": "TweetDeleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "tweeter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "tweetText",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "tweetImg",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isDeleted",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "tweetCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "newName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "newBio",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "newProfileImg",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "newProfileBanner",
          "type": "string"
        }
      ],
      "name": "updateUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllTweets",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "tweeter",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "tweetText",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "tweetImg",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isDeleted",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct Twitter.tweet[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        }
      ],
      "name": "getFollowers",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getHomeTweets",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "tweeter",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "tweetText",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "tweetImg",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isDeleted",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct Twitter.tweet[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "getMessages",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "content",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct Twitter.message[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyTweets",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "tweeter",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "tweetText",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "tweetImg",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isDeleted",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct Twitter.tweet[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getTweet",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tweetId",
          "type": "uint256"
        }
      ],
      "name": "getTweetLikes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        }
      ],
      "name": "getUser",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "bio",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "profileImg",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "profileBanner",
              "type": "string"
            }
          ],
          "internalType": "struct Twitter.user",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  let address = "0xd8C0147D4dF860b44BDAd4e37c71082a0C839d02";

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [provider,setProvider] = useState(window.ethereum);
  const [_web3mm, setweb3mm] = useState('');
  const [contractTwitter, setcontract] = useState('');
  const [walletAddress, setaccount] = useState('');

  const notification = useNotification();
  const [loading, setLoadingState] = useState(false);

  const infoNotification = (accountNum) => {
    notification({
      type: 'info',
      message: accountNum,
      title: 'Connected to Polygon Network',
      position: 'topR'
    });
  };

  useEffect(() => {

    /* if(provider == null){
       window.alert("No Metamask Installed")
       window.location.replace("https://metamask.io")
     }*/

    connectWallet();

    /*const handleAccountsChanged = (accounts) => {
      if(provider.chainId == "0x13881"){
        infoNotification(accounts[0]);
      }
      // Just to prevent reloading for the very first time
      if(JSON.parse(localStorage.getItem('activeAccount')) !=null){
        setTimeout(()=>{window.location.reload()},3000);
      }
    };

    const handleChainChanged = (chainId) => {
      if(chainId != "0x13881"){
        infoNotification();
      }
      window.location.reload();
    } 
    
    const handleDisconnect = ()=>{};
      

    provider.on("accountsChanged",handleAccountsChanged);
    provider.on("chainChanged",handleChainChanged);
    provider.on("disconnect",handleDisconnect);*/


  }, []);

  const connectWallet = async () => {

    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');

      const web3mm = new Web3(window.ethereum);
      setweb3mm(web3mm);

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3mm.eth.getAccounts();

      const account = accounts[0];
      setaccount(account);
      console.log("account : " + account);
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log("walletAddress : " + walletAddress);

      const contract = new web3mm.eth.Contract(ABI, address);
      setcontract(contract);
      await new Promise(resolve => setTimeout(resolve, 3000));

      const chainId = 5;

      if (window.ethereum.networkVersion !== chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: web3mm.utils.toHex(chainId) }],
          });
        } catch (err) {

          if (err.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {

                  chainName: 'Goerli Test Network',
                  chainId: web3mm.utils.toHex(chainId),
                  nativeCurrency: { name: 'Goerli Test Network', decimals: 18, symbol: 'GoerliETH' },
                  rpcUrls: ['https://goerli.infura.io/v3/'],

                },
              ],
            });
          }
        }
      }


      const getUserDetail = await contract.methods.getUser(account).call();
      console.log("getUserDetail : " + getUserDetail);

      if (getUserDetail['profileImg']) {
        //If user exist
        window.localStorage.setItem("activeAccount", JSON.stringify(account));
        window.localStorage.setItem("userName", JSON.stringify(getUserDetail['name']));
        window.localStorage.setItem("userBio", JSON.stringify(getUserDetail['bio']));
        window.localStorage.setItem("userImage", JSON.stringify(getUserDetail['profileImg']));
        window.localStorage.setItem("userBanner", JSON.stringify(getUserDetail['profileBanner']));
      } else {
        // 1st time user
        //Get a random avatar and update in the contract

        setLoadingState(true);
        let avatar = toonavatar.generate_avatar();
        let defaultBanner = "https://media.discordapp.net/attachments/1050552088779825176/1161661292495515718/nfthouse9_cyberpunk_street_cartoon_theme_aed1984a-d7cc-4300-957d-77d19186ce74.png?ex=65391c62&is=6526a762&hm=de16ef3c93d3d07265ca790e4b489c63e52b0aad6e33d7b7fc8608ac660f817f&=&width=746&height=418";

        window.localStorage.setItem("activeAccount", JSON.stringify(account));
        window.localStorage.setItem("userName", JSON.stringify(''));
        window.localStorage.setItem("userBio", JSON.stringify(''));
        window.localStorage.setItem("userImage", JSON.stringify(avatar));
        window.localStorage.setItem("userBanner", JSON.stringify(defaultBanner));

        /* try {
          // await contract.methods.updateUser('', '', avatar, defaultBanner).send({ gasPrice: 250000000000, gasLimit: 685000, from: account, value: 100000000000000000 });
           await contract.methods.updateUser("dfsf", "dfdfsf", "avatar", "defaultBanner").send({ gasPrice: 250000000000, gasLimit: 685000, from: account, value: 100000000000000000 });
         } catch (error) {
           console.log('ERROR', error);
           notification({
             type: 'Warning',
             message: 'Get Test Matic from Polygon faucet',
             title: 'Require minimum 0.1 MATIC',
             position: 'topR'
           });
           setLoadingState(false);
           return;
         }*/

      }

      setIsAuthenticated(true);

    } else {
      window.location.replace("https://metamask.io/");
    }

  }

  const updateUser = async () => {
    try {
      // await contract.methods.updateUser('', '', avatar, defaultBanner).send({ gasPrice: 250000000000, gasLimit: 685000, from: account, value: 100000000000000000 });
      await contractTwitter.methods.updateUser("dfsf", "dfdfsf", "avatar", "defaultBanner").send({ gasLimit: 685000, from: walletAddress, value: '100000000000000000' });
    } catch (error) {
      console.log('ERROR', error);
      notification({
        type: 'Warning',
        message: 'Get Test Matic from Polygon faucet',
        title: 'Require minimum 0.1 MATIC',
        position: 'topR'
      });
      setLoadingState(false);
      return;
    }
  }

  return (
    <>
      {isAuthenticated ? (
        <div className='page'>
          <div className='sideBar'>
            <Sidebar />
          </div>
          <div className='miniWindow'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/settings' element={<Settings />} />
            </Routes>
          </div>
          <div className='rightBar'>
            <Rightbar />
          </div>

        </div>
      ) : (
        <div className='loginPage'>
          <Twitter fill='#ffffff' fontSize={80} />
          {loading ? <Loading size={50} spinnerColor="green" /> : <Button onClick={connectWallet} size='xl' text='Connect with Metamask' theme='primary' icon={<Metamask />} />}
          <Button onClick={updateUser} size='xl' text='Update User' theme='primary' />

        </div>

      )}

    </>

  );
}

export default App;
