import React, { useState, useEffect, useRef } from "react";
import './TweetInFeed.css';
import { defaultImgs } from "../defaultImgs";
import { Avatar, Loading, useNotification } from "@web3uikit/core";
import { MessageCircle, Star, Matic, Bin, Calendar, Heart, FirebaseLogo, More, AddUser, Ban, Event, HandCoin, HeartFilled, Webhook, Frown } from "@web3uikit/icons";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import Post from "../pages/Post";
import { TwitterContractAddress, Web3StorageApi } from '../config';
import TwitterAbi from '../abi/Twitter.json';
import { Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom'; // Import useParams
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js';
import { Image } from '@web3uikit/icons';

const TweetReplies = ({ replies, passingTweetId, comingFromPost }) => {

    const Web3StorageApi = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGFBNzVBNzJENEM3ODFhNzhBMEMyODZjZWViZUMwODBhODI0NDNCNjciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTcxMzcyOTI5MDYsIm5hbWUiOiJUd2l0dGVyQVBJIn0.Bt_AyVqdv50PIZ-liMRjBsELi_E78iHBhn9N72JadvI";
    const inputFile = useRef(null);
    const [selectedImage, setSelectedImage] = useState();
    const [replyTxt, setReplyTxt] = useState('');
    const userImage = JSON.parse(localStorage.getItem('userImage'));
    const [selectedFile, setSelectedFile] = useState();
    const [uploading, setUploading] = useState(false);
    let ipfsUploadedUrl = '';
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [contractTwitter, setcontract] = useState('');
    const notification = useNotification();
    const navigate = useNavigate();
    const [_signerAddress, setSignerAddress] = useState('');

    if (!replies || replies.length === 0) {
        return null; // No replies to display
    }

    async function storeFile() {
        const client = new Web3Storage({ token: Web3StorageApi });
        const rootCid = await client.put(selectedFile);
        ipfsUploadedUrl = `https://${rootCid}.ipfs.dweb.link/${selectedFile[0].name}`;
    }

    async function addReply() {

        console.log("replyTxt : " + replyTxt);
        if (replyTxt.trim().length < 5) {
            notification({
                type: 'warning',
                message: 'Minimum 5 characters',
                title: 'Reply Required',
                position: 'topR'
            });
            return;
        }

        const sentences = replyTxt.split('\n'); // Split by line breaks

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
            // const data = await contract.getReplies(passingTweetId);

            /*const result = await Promise.all(data.map(async tweet => {

                const unixTime = reply.timestamp;
                const date = new Date(unixTime * 1000);
                const replyDate = date.toLocaleDateString("fr-CH");
    
                let getUserDetail = await contract.getUser(reply.tweeter);
                const following = await contract.isUserFollowing(signer.getAddress(), reply.tweeter);
    
                let originality = await contract.checkOriginalStatus(passingTweetId);
                console.log("reply.originality : " + originality);
    
                let getOriginalRetweetCountLikes = await contract.getOriginalRetweetCountLikes(passingTweetId);
                console.log("getOriginalRetweetCount : " + getOriginalRetweetCountLikes[0]);
                console.log("getOriginalLikes : " + getOriginalRetweetCountLikes[1]);
    
                let item = {
                    tweeter: reply.tweeter,
                    id: reply.id,
                    tweetText: reply.tweetText,
                    tweetImg: reply.tweetImg,
                    isDeleted: reply.isDeleted,
                    userName: getUserDetail['name'],
                    userImage: getUserDetail['profileImg'],
                    date: replyDate,
                    likes: Number(getOriginalRetweetCountLikes[1]),
                    isUserFollowing: following,
                    isRetweet: !originality,
                    retweeterAddress: reply.retweeter,
                    retweetCount: Number(getOriginalRetweetCountLikes[0])

                };

 
                // Add a unique "key" using the tweet ID
                item.key = reply.id;
    
    
                console.log("retweeter :" + item.retweeterAddress);
                console.log("retweeter :" + item.retweeterAddress);
    
                return item;
            }));*/

            const transaction = await contract.addReply(passingTweetId, combinedSentences, ipfsUploadedUrl);
            await transaction.wait();

            notification({
                type: 'success',
                title: 'Reply Added Successfully',
                position: 'topR'
            });


            setSelectedImage(null);
            setReplyTxt('');
            setSelectedFile(null);
            setUploading(false);

            window.location.reload();

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


    const onImageClick = () => {
        inputFile.current.click();
    }

    const changeHandler = (event) => {
        const imgFile = event.target.files[0];
        setSelectedImage(URL.createObjectURL(imgFile));
        setSelectedFile(event.target.files);
    }

    async function handleUserClick(_userWalletAddress) {

        if (_userWalletAddress != _signerAddress) {
            navigate(`/profile/${_userWalletAddress}` /* ), {
 
           state: {
                 userName : userName,
                 userBio : userBio,
                 userImage : userImage,
                 userBanner : userBanner
             },
         }*/);
        } else {
            navigate(`/profile/` /* ), {
 
                state: {
                      userName : userName,
                      userBio : userBio,
                      userImage : userImage,
                      userBanner : userBanner
                  },
              }*/);
        }
    }

    async function post(tweetID) {

        navigate(`/post/${tweetID}`/*, {
 
            state: {
                  tweetid : tweetID
            
              },
          }*/);
    }

    return (

        <div>

            {comingFromPost ?
                (<div className="tweet-replies">
                    {replies.map((reply, index) => (
                        <div key={index} className="tweet-reply">
                            {/* Render each reply here */}
                            {/* Example: */}

                            <div className="FeedTweet">
                                <div><Avatar onClick={(e) => { e.stopPropagation(); handleUserClick(reply.tweeter) }} isRounded image={reply.userImage} theme="image" className="avatar" /></div>
                                <div className="completeTweet">
                                    <div className="nameDate">
                                        <div className="user--1" onClick={(e) => { e.stopPropagation(); handleUserClick(reply.tweeter) }}>{reply.userName}</div>
                                    </div>
                                    <div className="accWhen">{reply.tweeter}</div>
                                    {(reply.tweetText.split('|@|')).map((sentence, index) => (
                                        <div key={index}>{sentence}</div>
                                    ))}

                                </div>
                            </div>
                        </div>
                    ))}
                </div>) :
                (<div className="tweet-replies">
                    {replies.map((reply, index) => (
                        <div key={index} className="tweet-reply">
                            {/* Render each reply here */}
                            {/* Example: */}

                            <div className="FeedTweet" onClick={(e) => { e.stopPropagation(); post(reply.tweetId) }}>
                                <div><Avatar onClick={(e) => { e.stopPropagation(); handleUserClick(reply.tweeter) }} isRounded image={reply.userImage} theme="image" className="avatar" /></div>
                                <div className="completeTweet">
                                    <div className="nameDate">
                                        <div className="user--1" onClick={(e) => { e.stopPropagation(); handleUserClick(reply.tweeter) }}>{reply.userName}</div>
                                    </div>
                                    <div className="accWhen">{reply.tweeter}</div>
                                    {(reply.tweetText.split('|@|')).map((sentence, index) => (
                                        <div key={index}>{sentence}</div>
                                    ))}

                                </div>
                            </div>
                        </div>
                    ))}
                </div>)}
        </div>
    );
}

export default TweetReplies;