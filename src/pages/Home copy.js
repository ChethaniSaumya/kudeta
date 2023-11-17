import React, { useState, useRef } from "react";
//import { Link } from "react-router-dom";
import "./Home.css";
import { Avatar, Loading, useNotification } from "@web3uikit/core";
import { Image } from '@web3uikit/icons';
import { defaultImgs } from '../defaultImgs';
import TweetInFeed from "../components/TweetInFeed";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import { TwitterContractAddress } from './config';
import TwitterAbi from './abi/Twitter.json'
import { Web3Storage } from 'web3.storage'

const Home = () => {

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

    const Web3StorageApi = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGFBNzVBNzJENEM3ODFhNzhBMEMyODZjZWViZUMwODBhODI0NDNCNjciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTcxMzcyOTI5MDYsIm5hbWUiOiJUd2l0dGVyQVBJIn0.Bt_AyVqdv50PIZ-liMRjBsELi_E78iHBhn9N72JadvI";

    const inputFile = useRef(null);
    const [selectedImage, setSelectedImage] = useState();
    const [tweetText, setTweetText] = useState('');
    const userImage = JSON.parse(localStorage.getItem('userImage'));
    const [selectedFile, setSelectedFile] = useState();
    const [uploading, setUploading] = useState(false);
    let ipfsUploadedUrl = '';
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [_web3mm, setweb3mm] = useState('');
    const [contractTwitter, setcontract] = useState('');
    const [walletAddress, setaccount] = useState('');
    const notification = useNotification();

    async function storeFile() {
        const client = new Web3Storage({ token: Web3StorageApi });
        const rootCid = await client.put(selectedFile);
        ipfsUploadedUrl = `https://${rootCid}.ipfs.dweb.link/${selectedFile[0].name}`;
    }

    const onImageClick = () => {
        inputFile.current.click();
    }

    const changeHandler = (event) => {
        const imgFile = event.target.files[0];
        setSelectedImage(URL.createObjectURL(imgFile));
        setSelectedFile(event.target.files);
    }

    async function addTweet() {

        console.log("tweetText : " + tweetText);
        if (tweetText.trim().length < 5) {
            notification({
                type: 'warning',
                message: 'Minimum 5 characters',
                title: 'Tweet Field Required',
                position: 'topR'
            });
            return;
        }
        setUploading(true);
        if (selectedImage) {
            await storeFile();
        }

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

        try {

            console.log("I'm here1");
            console.log("ipfsUploadedUrl : " + ipfsUploadedUrl);

            await contract.methods.addTweet(tweetText, ipfsUploadedUrl).send({ gasLimit: 685000, from: account, value: '10000000000000000' });

            notification({
                type: 'success',
                title: 'Tweet Added Successfully',
                position: 'topR'
            });

            console.log("I'm here2");

            setSelectedImage(null);
            setTweetText('');
            setSelectedFile(null);
            setUploading(false);
        } catch (error) {
            notification({
                type: 'error',
                title: 'Transaction Error',
                message: error.message,
                position: 'topR'
            });
            setUploading(false);
        }

    }

    return (
        <>
            <div className="mainContent">
                <div className="profileTweet">
                    <div className="tweetSection">
                        <Avatar isRounded image={userImage} theme="image" size={60} />
                        <textarea value={tweetText} name="TweetTxtArea" placeholder=" What's going on ?" className="textArea" onChange={(e) => setTweetText(e.target.value)}></textarea>
                    </div>
                    <div className="tweetSection">
                        <div className="imgDiv" onClick={onImageClick}>
                            <input type="file" ref={inputFile} onChange={changeHandler} style={{ display: "none" }} />
                            {selectedImage ? <img src={selectedImage} width={150} /> : <Image fontSize={25} fill="#ffffff" />}

                        </div>
                        <div className="tweet" onClick={addTweet}>{uploading ? <Loading /> : 'Tweet'}</div>
                    </div>
                </div>
                <TweetInFeed profile={false} reload={uploading} />
            </div>
        </>
    )
}

export default Home;