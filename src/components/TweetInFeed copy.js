import React, { useState, useEffect } from "react";
import './TweetInFeed.css';
import { defaultImgs } from "../defaultImgs";
import { Avatar, Loading, useNotification } from "@web3uikit/core";
import { MessageCircle, Star, Matic, Bin, Calendar, heart, Heart, More, AddUser, Ban, Event } from "@web3uikit/icons";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import { TwitterContractAddress, Web3StorageApi } from '../config';
import TwitterAbi from '../abi/Twitter.json';
import { Link, useNavigate } from 'react-router-dom';

const TweetInFeed = (props) => {

    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = (e) => {
        e.stopPropagation(); // Prevent other click events from propagating
        setDropdownOpen(!isDropdownOpen);
    };
    const onlyUser = props.profile;
    const otherUser = props.userProfile;
    const userWalletAddress = props.userWallet;
    let reloadComponent = props.reload;
    const [blockedUsers, setBlockedUsers] = useState([]);

    const [tweets, setTweets] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');
    const [contractTwitter, setcontract] = useState('');
    const [_signerAddress, setSignerAddress] = useState('');
    const [userName, setUserName] = useState('');
    const [userBio, setBio] = useState('');
    const [userImage, setUserImg] = useState('');
    const [userBanner, setUserBanner] = useState('');


    const notification = useNotification();
    const navigate = useNavigate();

    const handleDropdownOption = (action, user) => {
        // Handle the selected dropdown option here
        if (action === "Not interested") {
            // Handle "Not interested" action
        } else if (action === "Mute" && user) {
            // Handle "Mute" action with the specified user
        }
        // Close the dropdown
        setDropdownOpen(false);
    };

    async function walletConnect() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        setSignerAddress(signerAddress);
        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer)
        setcontract(contract);
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



    async function getTweetLikes(tweetId) {
        const data = await contractTwitter.getTweetLikes(tweetId);
        console.log("likes : " + data);
    }

    useEffect(() => {
        walletConnect();

        if (otherUser) {
            loadUserTweets(userWalletAddress);
        } else {

            if (onlyUser) {
                loadMyTweets();
            } else {
                loadAllTweets();
            }
        }
    }, [reloadComponent]);

    async function loadMyTweets() {

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);

       // const data = await contract.getMyTweets();

         // Fetch the user's profile information
         let getUserDetail = await contract.getUser(signerAddress);
         const data = await contract.getUserTweets(signerAddress);

        const userName = JSON.parse(localStorage.getItem('userName'));
        const userImage = JSON.parse(localStorage.getItem('userImage'));

        const result = await Promise.all(data.map(async tweet => {
            const unixTime = tweet.timestamp;
            const date = new Date(unixTime * 1000);
            const tweetDate = date.toLocaleDateString("fr-CH");

            let item = {
                tweeter: tweet.tweeter,
                id: tweet.id,
                tweetText: tweet.tweetText,
                tweetImg: tweet.tweetImg,
                isDeleted: tweet.isDeleted,
                userName: getUserDetail['name'],
                userImage: getUserDetail['profileImg'],
                date: tweetDate,
                likes: Number(tweet.likes)
            };

            // Add a unique "key" using the tweet ID
            item.key = tweet.id;

            return item;
        }));

        setTweets(result.reverse());
        setLoadingState('loaded');

        const filteredTweets = result.filter(tweet => !blockedUsers.includes(tweet.tweeter));

        setTweets(filteredTweets.reverse());
        setLoadingState('loaded');
    }

    async function loadUserTweets(userAddress) {

        console.log("userAddress : " + userAddress);
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        console.log("signerAddress :" + signerAddress);

        if (userAddress == signerAddress) {
            loadMyTweets();
        } else {

            const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);

            // Fetch the user's profile information
            let getUserDetail = await contract.getUser(userAddress);

            const data = await contract.getUserTweets(userAddress);

            const result = await Promise.all(data.map(async tweet => {
                const unixTime = tweet.timestamp;
                const date = new Date(unixTime * 1000);
                const tweetDate = date.toLocaleDateString("fr-CH");

                let item = {
                    tweeter: tweet.tweeter,
                    id: tweet.id,
                    tweetText: tweet.tweetText,
                    tweetImg: tweet.tweetImg,
                    isDeleted: tweet.isDeleted,
                    userName: getUserDetail['name'],
                    userImage: getUserDetail['profileImg'],
                    date: tweetDate,
                    likes: Number(tweet.likes)
                };

                // Add a unique "key" using the tweet ID
                item.key = tweet.id;
                return item;
            }));

            //  handleUserClick(userAddress);

            setTweets(result.reverse());
            setLoadingState('loaded');

            
        const filteredTweets = result.filter(tweet => !blockedUsers.includes(tweet.tweeter));

        setTweets(filteredTweets.reverse());
        setLoadingState('loaded');
        }


    }

    async function loadAllTweets() {

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();


        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer)

        const data = await contract.getAllTweets();
        const result = await Promise.all(data.map(async tweet => {
            const unixTime = tweet.timestamp;
            const date = new Date(unixTime * 1000);
            const tweetDate = date.toLocaleDateString("fr-CH");
            let getUserDetail = await contract.getUser(tweet.tweeter);

            let item = {
                tweeter: tweet.tweeter,
                id: tweet.id,
                tweetText: tweet.tweetText,
                tweetImg: tweet.tweetImg,
                isDeleted: tweet.isDeleted,
                userName: getUserDetail['name'],
                userImage: getUserDetail['profileImg'],
                date: tweetDate,
                likes: Number(tweet.likes)

            };

            // Add a unique "key" using the tweet ID
            item.key = tweet.id;

            return item;
        }));

        setTweets(result.reverse());
        setLoadingState('loaded');

        const filteredTweets = result.filter(tweet => !blockedUsers.includes(tweet.tweeter));

        setTweets(filteredTweets.reverse());
        setLoadingState('loaded');
    }

    async function deleteTweet(tweetId) {
        setLoadingState('not-loaded')

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer)
        const data = await contract.deleteTweet(tweetId, true);
        await data.wait();
        notification({
            type: 'success',
            title: 'Tweet Deleted Successfully',
            position: 'topR',
            icon: <Bin />
        });

        loadMyTweets();

    }

    async function likeTweet(tweetId) {

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer)
        try {
            const data = await contract.likeTweet(tweetId);
            await data.wait();
            notification({
                type: 'success',
                title: 'Tweet liked Successfully',
                position: 'topR'
            });
        } catch (error) {
            console.log('ERROR', error);
            const reason = error.reason || "Unknown Reason";

            notification({
                type: 'warning',
                message: `Error: ${reason}`,
                title: 'Error',
                position: 'topR'
            });
            return;
        }

        // loadMyTweets();
        window.location.reload();
    }

    async function blockUser(userToBlock) {
        try {
            // Call the Ethereum smart contract's "blockUser" function to block the specified user
            await contractTwitter.blockUser(userToBlock);
            notification({
                type: 'success',
                title: 'User Blocked Successfully',
                position: 'topR',
            });
        } catch (error) {
            console.error('Error blocking user:', error);
            notification({
                type: 'error',
                message: 'Failed to block user',
                title: 'Error',
                position: 'topR',
            });
        }

        setBlockedUsers([...blockedUsers, userToBlock]);

    }


    if (loadingState == 'not-loaded') return (
        <div className="loading">
            <Loading size={60} spinnerColor="#8247" />
        </div>
    )

    if (loadingState == 'loaded' && !tweets.length) return (
        <h1 className="loading">No Tweet Available</h1>
    )

    return (
        <>
            {
                tweets.map((tweet, i) => (
                    <div className="FeedTweet">
                        <Link to="/otherusers" className='link'><Avatar isRounded image={tweet.userImage} theme="image" className="avatar" /></Link>
                        <div className="completeTweet">
                            <div className="who">
                                {tweet.userName}
                                <div className="accWhen" onClick={() => { handleUserClick(tweet.tweeter) }}>{tweet.tweeter}</div>

                                <div className="dropdown" onClick={(e) => toggleDropdown(e)}>
                                    <More theme="image" size={60} />
                                    {isDropdownOpen && (
                                        <div className="dropdown-content">
                                            <div onClick={() => handleDropdownOption("Not interested")}>Not interested in this post</div>
                                            <div onClick={() => handleDropdownOption("Not interested")}><AddUser size={30} /> Follow {tweet.userName}</div>
                                            <div onClick={() => handleDropdownOption("Mute", tweet.tweeter)}> Mute {tweet.userName}</div>
                                            <div onClick={() => blockUser(tweet.tweeter)} ><Ban size={30} /> Block {tweet.userName + "0"}</div>
                                            <div onClick={() => handleDropdownOption("Mute", tweet.tweeter)}>Embed post {tweet.userName}</div>
                                            <div onClick={() => handleDropdownOption("Mute", tweet.tweeter)}><Event size={30} /> Report post {tweet.userName}</div>

                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="tweetContent">
                                {tweet.tweetText}
                                {tweet.tweetImg != '' && (
                                    <img src={tweet.tweetImg} className="tweetImg" />
                                )}
                            </div>
                            <div className="interactions">
                                <div className="interactionNums"><MessageCircle fontSize={20} />0</div>
                                <div className="interactionNums"><Heart onClick={() => likeTweet(tweet.id)} fontSize={20} />{tweet.likes}</div>
                                <div className="interactionNums"><Calendar fontSize={20} />{tweet.date}</div>
                                {onlyUser ? <div className="interactionNums"><Bin fontSize={20} color="#FF0000" onClick={() => deleteTweet(tweet.id)} /></div> : <div className="interactionNums"><Matic fontSize={20} /></div>
                                }

                            </div>
                        </div>
                    </div>
                ))
            }

        </>
    );
}

export default TweetInFeed;