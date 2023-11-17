import React, { useState, useRef, useEffect } from "react";
//import { Link } from "react-router-dom";
import "./Messages.css";
import "../components/TweetInFeed.css";
import { Avatar, Loading, useNotification } from "@web3uikit/core";
import { Image } from '@web3uikit/icons';
import { defaultImgs } from '../defaultImgs';
import Home from "../pages/Home";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import { TwitterContractAddress, Web3StorageApi, TwitterContractAddress3 } from '../config';
import TwitterAbi from '../abi/Twitter.json';
import TwitterAbi3 from '../abi/Twitter3.json';
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js';
import { Link, useNavigate } from "react-router-dom";

const Messages = () => {

    const Web3StorageApi = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGFBNzVBNzJENEM3ODFhNzhBMEMyODZjZWViZUMwODBhODI0NDNCNjciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTcxMzcyOTI5MDYsIm5hbWUiOiJUd2l0dGVyQVBJIn0.Bt_AyVqdv50PIZ-liMRjBsELi_E78iHBhn9N72JadvI";
    const inputFile = useRef(null);
    const [selectedImage, setSelectedImage] = useState();
    const [tweetText, setTweetText] = useState('');
    const userImage = JSON.parse(localStorage.getItem('userImage'));
    const [selectedFile, setSelectedFile] = useState();
    const [uploading, setUploading] = useState(false);
    let ipfsUploadedUrl = '';
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [contractTwitter, setcontract] = useState('');
    const [_signerAddress, setSignerAddress] = useState('');
    const notification = useNotification();
    const navigate = useNavigate();
    const [msgs, setMsgs] = useState([]);
    const [clickedMsgs, setClickedMsgs] = useState([]);
    const msgContainerRef = useRef(null); // Create a ref for the message container

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


    async function listUserConversations() {

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract3 = new ethers.Contract(TwitterContractAddress3, TwitterAbi3.abi, signer)
        const signerAddress = await signer.getAddress();
        setSignerAddress(signerAddress);
        // const tweetValue = "0.01";
        // const price = ethers.utils.parseEther(tweetValue);
        const getnetwork = await provider.getNetwork();

        const transaction = await contract3.listUserConversations(signerAddress);
        console.log("Msg List : " + transaction);

        const result = await Promise.all(transaction.map(async msg => {

            const getConversationMessages = await contract3.getConversationMessages(Number(msg.conversationId));

            let msgOrder = [];
            for (let x = 0; x < getConversationMessages.length; x++) {
                console.log("getConversationMessages: " + getConversationMessages[x].content);
                msgOrder.push(getConversationMessages[x].content);
            }

            let item = {
                sender: msg.user1,
                receiver: msg.user2,
                conId: Number(msg.conversationId),
                msgContent: msgOrder
            };

            console.log("sender : " + item.sender);
            console.log("receiver : " + item.receiver);
            console.log("conId : " + item.conId);

            item.key = msg.conversationId;
            return item;

        }));

        setMsgs(result.reverse());
        console.log("result : " + result);
        console.log("msgs : " + msgs);

    }

    async function msgClick(conversationId) {

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract3 = new ethers.Contract(TwitterContractAddress3, TwitterAbi3.abi, signer)
        const signerAddress = await signer.getAddress();
        setSignerAddress(signerAddress);

        const getConversationMessages = await contract3.getConversationMessages(0);

        const result = await Promise.all(getConversationMessages.map(async clicked => {

            for (let x = 0; x < getConversationMessages.length; x++) {
                console.log("getConversationMessages: " + getConversationMessages[x]);
            }

            let item = {
                sender: clicked.sender,
                msgContent: clicked.content
            };

            return item;

        }));

        setClickedMsgs(result);
        console.log("msgs : " + msgs);

        if (msgContainerRef.current) {
            msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight;
        }

    }

    useEffect(() => {

        listUserConversations();

    }, []);

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

        const sentences = tweetText.split('\n'); // Split by line breaks

        // Join the sentences with a delimiter
        const combinedSentences = sentences.join('|@|');

        setUploading(true);
        if (selectedImage) {
            await storeFile();
        }

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer)
        // const tweetValue = "0.01";
        // const price = ethers.utils.parseEther(tweetValue);
        const getnetwork = await provider.getNetwork();

        try {

            console.log("ipfsUploadedUrl : " + ipfsUploadedUrl);

            const transaction = await contract.addTweet(combinedSentences, ipfsUploadedUrl/*,{value:price}*/);
            await transaction.wait();

            notification({
                type: 'success',
                title: 'Tweet Added Successfully',
                position: 'topR'
            });


            setSelectedImage(null);
            setTweetText('');
            setSelectedFile(null);
            setUploading(false);

            navigate('/');

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

                <div>
                    <div class="formMain2">
                        <div class="formMain-2">
                            <div className="who2">
                                <div className="who3">

                                    <div><Avatar isRounded theme="image" className="avatar" /></div>
                                    <div className="completeTweet2">


                                        <div className="senders">
                                            {
                                                msgs.map((msg, i) => {
                                                    return (

                                                        <div onClick={() => msgClick(Number(msg.conversationId))}>
                                                            <div className="nameDate">
                                                                <div className="user--1" >{msg.sender.slice(0, 3) + "..." + msg.sender.slice(39, 49)}</div>
                                                            </div>
                                                            <div></div>
                                                            <div className="accWhen">{msg.conId}</div>
                                                            <div className="accWhen">dfdf</div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="msgs" ref={msgContainerRef}>
                                {
                                    clickedMsgs.map((clicked, i) => {
                                        return (
                                            <div class="senderAndRec">
                                                {_signerAddress == clicked.sender ?
                                                    (
                                                        <div className="msgCon" >
                                                            <div>
                                                                <div className="accWhen">{clicked.sender.slice(0, 3) + "..." + clicked.sender.slice(39, 49)}</div>
                                                                <div className="cont">{clicked.msgContent}</div>
                                                            </div>
                                                            <div className="c">Aug 29, 2023, 1:43 AM</div>
                                                        </div>

                                                    ) :

                                                    (<div className="msgCon2" >
                                                        <div>
                                                            <div className="accWhen">{clicked.sender.slice(0, 3) + "..." + clicked.sender.slice(39, 49)}</div>
                                                            <div className="cont">{clicked.msgContent}</div>
                                                        </div>
                                                        <div className="day">Aug 29, 2023, 1:43 AM</div>
                                                    </div>)}
                                            </div>
                                        );
                                    })}
                            </div>

                        </div>
                    </div>

                </div>

            </div>
        </>
    )
}

export default Messages;