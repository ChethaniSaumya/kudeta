import React, { useState, useEffect } from "react";
import './TweetInFeed.css';
import { defaultImgs } from "../defaultImgs";
import { Avatar, Loading, useNotification } from "@web3uikit/core";
import { MessageCircle, Star, Matic, Bin, Calendar, Heart, FirebaseLogo, More, AddUser, Ban, Event, HandCoin, HeartFilled, Webhook, Frown, Paperclip } from "@web3uikit/icons";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import Post from "../pages/Post";
import { TwitterContractAddress, Web3StorageApi } from '../config';
import { TwitterContractAddress2 } from '../config';
import TwitterAbi from '../abi/Twitter.json';
import TwitterAbi2 from '../abi/Twitter2.json';
import { Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom'; // Import useParams

const TweetInFeed = (props) => {

    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = (e) => {
        e.stopPropagation(); // Prevent other click events from propagating
        setDropdownOpen(!isDropdownOpen);
    };
    const isNotemarked = props.notemarks;
    const onlyUser = props.profile;
    const otherUser = props.userProfile;
    const { _userWalletAddress } = useParams(); // Extract the username from the URL
    const activeAccount = _userWalletAddress;
    const userWalletAddress = props.userWallet;
    let reloadComponent = props.reload;
    const following = props.following;
    const myLikePageActivatedInFeed = props.myLikePageActivatedInFeed;
    const userLikePageActivatedInFeed = props.userLikePageActivatedInFeed;
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const [bookMarked, setBookMarked] = useState(false);
    const [followingStatus, setFollowingStatus] = useState(isFollowingUser);
    const [followingCount, setFollowingCount] = useState(0);
    const [followersCount, setFollowersCount] = useState(0);
    const [userProfileAddress, setUserProfileAddress] = useState('');
    const [homeOrFollowing, setHomeOrFollowing] = useState(false);
    const [loading, setNewLoadingState] = useState(false);

    const [tweets, setTweets] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');
    const [contractTwitter, setcontract] = useState('');
    const [_signerAddress, setSignerAddress] = useState('');
    const [userName, setUserName] = useState('');
    const [userBio, setBio] = useState('');
    const [userImage, setUserImg] = useState('');
    const [userBanner, setUserBanner] = useState('');
    const [isRetweetByUser, setIsRetweetByUser] = useState('');
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [_popUp, set_popUp] = useState(0);
    const [receivingWallet, setReceivingWallet] = useState('');
    const [hasLikedTweet, setHasLikedTweet] = useState('');


    const notification = useNotification();
    const navigate = useNavigate();

    const filterBlockedTweets = (tweets) => {
        return tweets.filter(tweet => !blockedUsers.includes(tweet.tweeter));
    };

    async function popUp() {
        set_popUp(1);
        //this.setState({ _navbarOpen: 0 });
    }

    const sendMaticWithTip = async (recipient) => {
        setNewLoadingState(true);

        // set_popUp(1);
        setReceivingWallet(recipient);
        sendMaticForm();
    }

    const sendMaticForm = async () => {
        try {
            // Get the Web3 provider
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);

            // Get the signer
            const signer = provider.getSigner();

            // Create a contract instance
            const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);

            // Convert the recipient address to a string
            const recipientString = receivingWallet.toString();

            // Parse the ether amount
            const etherAmount = ethers.utils.parseEther('1');

            // Send the tip
            const tx = await contract.sendMaticWithTip('0', recipientString, { value: '20000000000000000' });
            await tx.wait();
            setNewLoadingState(false);

            // Show a success notification
            /*   notification({
                   type: 'success',
                   title: 'Tiped Successfully',
                   position: 'topR',
               });
   */
            window.location.reload();

        } catch (error) {
            // Show an error notification
            /*      notification({
                      type: 'error',
                      title: 'Transaction Error',
                      message: [error],
                      position: 'topR',
                  });*/
        }
    }

    async function followUser() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);

        try {
            // Call the contract function to follow the user
            const transaction = await contract.followUser(activeAccount);
            await transaction.wait();

            // Set isFollowingUser to true to update the button text
            setIsFollowingUser(true);

            notification({
                type: 'success',
                title: 'Followed Successfully',
                position: 'topR'
            });
        } catch (error) {
            notification({
                type: 'error',
                title: 'Transaction Error',
                message: error.message,
                position: 'topR'
            });
        }
    }

    async function followUserDropDown(userSelected) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);

        try {
            // Call the contract function to follow the user
            const transaction = await contract.followUser(userSelected);
            await transaction.wait();

            // Set isFollowingUser to true to update the button text
            setIsFollowingUser(true);

            notification({
                type: 'success',
                title: 'Followed Successfully',
                position: 'topR'
            });
        } catch (error) {
            notification({
                type: 'error',
                title: 'Transaction Error',
                message: error.message,
                position: 'topR'
            });
        }
    }

    async function unfollowUser(activeAccount) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();

        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);
        console.log("activeAccount22 :" + activeAccount);
        try {
            const transaction = await contract.unFollowUser(activeAccount);
            await transaction.wait();

            // Update the local state and storage to reflect that the user is no longer following
            setFollowingStatus(false);
            // localStorage.setItem("followStatus", JSON.stringify(false));

            notification({
                type: 'success',
                title: 'Unfollowed Successfully',
                position: 'topR'
            });

            window.location.reload();

        } catch (error) {
            notification({
                type: 'error',
                title: 'Transaction Error',
                message: error.message,
                position: 'topR'
            });
        }
    }

    async function blockUser(userToBlock) {
        try {
            // Call the Ethereum smart contract's "blockUser" function to block the specified user
            const blockUser = await contractTwitter.blockUser(userToBlock);
            await blockUser.wait();
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

        // Update the state with the blocked user
        setBlockedUsers([...blockedUsers, userToBlock]);
    }

    async function blockTweet(tweetID) {
        try {
            // Call the Ethereum smart contract's "blockTweet" function to block the specified tweet
            const blockResult = await contractTwitter.blockTweet(tweetID);
            await blockResult.wait();
            notification({
                type: 'success',
                title: 'Note Blocked Successfully',
                position: 'topR',
            });
            window.location.reload();
        } catch (error) {
            notification({
                type: 'error',
                message: 'Failed to block tweet',
                title: 'Error',
                position: 'topR',
            });
        }

        // You can update your application's state here as needed
        // For example, if you want to maintain a list of blocked tweets:
        // setBlockedTweets([...blockedTweets, tweetID]);
    }

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

        if (isNotemarked) {
            loadMyNotemarks();
        } else if (!following) {
            if (myLikePageActivatedInFeed || userLikePageActivatedInFeed) {
                if (myLikePageActivatedInFeed) {
                    loadMyLikedTweets();
                } else if (userLikePageActivatedInFeed) {
                    loadUserLikedTweets(userWalletAddress);
                }

            } else if (otherUser) {
                loadUserTweets(userWalletAddress);
            } else {
                if (onlyUser) {
                    loadMyTweets();
                } else {
                    loadAllTweets();
                }
            }
        } else {
            loadMyFollowingTweets();
        }

    }, [reloadComponent]);

    async function checkIsFollowing(userSelected) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        setSignerAddress(signer);

        setUserProfileAddress(signer.getAddress());
        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);
        const following = await contract.isUserFollowing(signer.getAddress(), userSelected);
        setIsFollowingUser(following);


    };

    async function loadMyTweets() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);

        // const data = await contract.getMyTweets();

        let getUserDetail = await contract.getUser(signerAddress);
        const data = await contract.getUserTweets(signerAddress);

        // const userName = JSON.parse(localStorage.getItem('userName'));
        // const userImage = JSON.parse(localStorage.getItem('userImage'));
        const result = await Promise.all(data.map(async tweet => {
            const unixTime = tweet.timestamp;
            const date = new Date(unixTime * 1000);
            const tweetDate = date.toLocaleDateString("fr-CH");

            let isRetweetByUser2 = await contract.isRetweetByUser(tweet.id, signerAddress);

            let getUserDetail = await contract.getUser(tweet.tweeter);
            const following = await contract.isUserFollowing(signer.getAddress(), tweet.tweeter);

            let getOriginalRetweetCountLikes = await contract.getOriginalRetweetCountLikes(tweet.id);
            console.log("getOriginalRetweetCount : " + getOriginalRetweetCountLikes[0]);
            console.log("getOriginalLikes : " + getOriginalRetweetCountLikes[1]);

            let originality = await contract.checkOriginalStatus(tweet.id);
            let originalTweetID;

            if (originality) {
                originalTweetID = tweet.id;
            } else {
                originalTweetID = tweet.originalTweetID;
            }

            let getOriginalReplyCount = await contract.getReplyCount(originalTweetID);
            console.log("getOriginalReplyCount : " + getOriginalReplyCount);

            let hasLikedTweet = await contract.hasLikedTweet(signerAddress, originalTweetID);
            setHasLikedTweet(hasLikedTweet);
            console.log("hasLikedTweet : " + hasLikedTweet);

            const contract2 = new ethers.Contract(TwitterContractAddress2, TwitterAbi2.abi, signer);

            const isTweetBookmarked = await contract2.isTweetBookmarked(signerAddress, originalTweetID);
            console.log("isTweetBookmarked Up: " + isTweetBookmarked);

            let item = {
                tweeter: tweet.tweeter,
                id: tweet.id,
                tweetText: tweet.tweetText,
                tweetImg: tweet.tweetImg,
                isDeleted: tweet.isDeleted,
                userName: getUserDetail['name'],
                userImage: getUserDetail['profileImg'],
                date: tweetDate,
                // likes: Number(tweet.likes),
                isRetweet: isRetweetByUser2,
                likes: Number(getOriginalRetweetCountLikes[1]),
                isUserFollowing: following,
                isRetweet: !originality,
                retweeterAddress: tweet.retweeter,
                retweetCount: Number(getOriginalRetweetCountLikes[0]),
                originalID: originalTweetID,
                replyCount: Number(getOriginalReplyCount),
                isLikedByMe: hasLikedTweet,
                bookMarked: isTweetBookmarked
            };

            // Add a unique "key" using the tweet ID
            item.key = tweet.id;
            console.log("reply Count :" + item.replyCount)
            return item;


        }));

        setTweets(result.reverse());
        //setTweets(result);
        setLoadingState('loaded');

    }

    async function loadMyNotemarks() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);
        const contract2 = new ethers.Contract(TwitterContractAddress2, TwitterAbi2.abi, signer);

        // const data = await contract.getMyTweets();

        //let getUserDetail = await contract.getUser(signerAddress);
        // const data = await contract.getUserTweets(signerAddress);

        /* let data;
         const getBookmarkedTweets = await contract2.getBookmarkedTweets(signerAddress);
         for (let x = 0; x < getBookmarkedTweets.length; x++) {
             console.log("getBookmarkedTweets X :" + getBookmarkedTweets[x]);
             data = await contract.getTweetById(Number(getBookmarkedTweets[x]));
             console.log("Data :" + data);
 
         }*/

        let data = [];

        const getBookmarkedTweets = await contract2.getBookmarkedTweets(signerAddress);
        for (let x = 0; x < getBookmarkedTweets.length; x++) {
            console.log("getBookmarkedTweets X :" + getBookmarkedTweets[x]);
            const tweetId = Number(getBookmarkedTweets[x]);
            const tweetData = await contract.getTweetById(tweetId);
            console.log("Data :" + tweetData);

            data.push(tweetData); // Add the tweet data to the array
        }


        // console.log("getTweetById : " + getTweetById);

        // const userName = JSON.parse(localStorage.getItem('userName'));
        // const userImage = JSON.parse(localStorage.getItem('userImage'));
        const result = await Promise.all(data.map(async tweet => {
            const unixTime = tweet.timestamp;
            const date = new Date(unixTime * 1000);
            const tweetDate = date.toLocaleDateString("fr-CH");

            let isRetweetByUser2 = await contract.isRetweetByUser(tweet.id, signerAddress);

            let getUserDetail = await contract.getUser(tweet.tweeter);
            const following = await contract.isUserFollowing(signer.getAddress(), tweet.tweeter);

            let getOriginalRetweetCountLikes = await contract.getOriginalRetweetCountLikes(tweet.id);
            console.log("getOriginalRetweetCount : " + getOriginalRetweetCountLikes[0]);
            console.log("getOriginalLikes : " + getOriginalRetweetCountLikes[1]);

            let originality = await contract.checkOriginalStatus(tweet.id);
            let originalTweetID;

            if (originality) {
                originalTweetID = tweet.id;
            } else {
                originalTweetID = tweet.originalTweetID;
            }

            let getOriginalReplyCount = await contract.getReplyCount(originalTweetID);
            console.log("getOriginalReplyCount : " + getOriginalReplyCount);

            let hasLikedTweet = await contract.hasLikedTweet(signerAddress, originalTweetID);
            setHasLikedTweet(hasLikedTweet);
            console.log("hasLikedTweet : " + hasLikedTweet);

            const isTweetBookmarked = await contract2.isTweetBookmarked(signerAddress, originalTweetID);
            console.log("isTweetBookmarked Up: " + isTweetBookmarked);

            let item = {
                tweeter: tweet.tweeter,
                id: tweet.id,
                tweetText: tweet.tweetText,
                tweetImg: tweet.tweetImg,
                isDeleted: tweet.isDeleted,
                userName: getUserDetail['name'],
                userImage: getUserDetail['profileImg'],
                date: tweetDate,
                // likes: Number(tweet.likes),
                isRetweet: isRetweetByUser2,
                likes: Number(getOriginalRetweetCountLikes[1]),
                isUserFollowing: following,
                isRetweet: !originality,
                retweeterAddress: tweet.retweeter,
                retweetCount: Number(getOriginalRetweetCountLikes[0]),
                originalID: originalTweetID,
                replyCount: Number(getOriginalReplyCount),
                isLikedByMe: hasLikedTweet,
                bookMarked: isTweetBookmarked
            };

            // Add a unique "key" using the tweet ID
            item.key = tweet.id;
            console.log("reply Count :" + item.replyCount)
            return item;



        }));

        // Filter out undefined (non-bookmarked) entries
        //   const bookmarkedTweets = result.filter(tweet => tweet.bookMarked);
        //   console.log("bookmarkedTweets :" + bookmarkedTweets);
        // Update state outside of the map function
        //  setTweets(bookmarkedTweets.reverse());

        setTweets(result.reverse());
        setLoadingState('loaded');

    }

    async function createReNote(tweetID) {

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);

        try {
            const data = await contract.createRetweet(tweetID);
            await data.wait();
            notification({
                type: 'success',
                title: 'Re-noted Successfully',
                position: 'topR'
            });
            await new Promise(resolve => setTimeout(resolve, 5000));
            window.location.reload();

        } catch (error) {
            notification({
                type: 'error',
                title: 'Transaction Error',
                message: error.message,
                position: 'topR'
            });
        }
    }

    async function loadMyLikedTweets() {

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);

        const data = await contract.getLikedTweetsForUser(signerAddress);

        // const userName = JSON.parse(localStorage.getItem('userName'));
        // const userImage = JSON.parse(localStorage.getItem('userImage'));

        const result = await Promise.all(data.map(async tweet => {
            const unixTime = tweet.timestamp;
            const date = new Date(unixTime * 1000);
            const tweetDate = date.toLocaleDateString("fr-CH");

            let getUserDetail = await contract.getUser(tweet.tweeter);


            let getOriginalRetweetCountLikes = await contract.getOriginalRetweetCountLikes(tweet.id);
            console.log("getOriginalRetweetCount : " + getOriginalRetweetCountLikes[0]);
            console.log("getOriginalLikes : " + getOriginalRetweetCountLikes[1]);

            let originality = await contract.checkOriginalStatus(tweet.id);
            let originalTweetID;

            if (originality) {
                originalTweetID = tweet.id;
            } else {
                originalTweetID = tweet.originalTweetID;
            }

            let getOriginalReplyCount = await contract.getReplyCount(originalTweetID);
            console.log("getOriginalReplyCount : " + getOriginalReplyCount);

            let hasLikedTweet = await contract.hasLikedTweet(signerAddress, originalTweetID);
            setHasLikedTweet(hasLikedTweet);
            console.log("hasLikedTweet : " + hasLikedTweet);

            const contract2 = new ethers.Contract(TwitterContractAddress2, TwitterAbi2.abi, signer);

            const isTweetBookmarked = await contract2.isTweetBookmarked(signerAddress, originalTweetID);
            console.log("isTweetBookmarked Up: " + isTweetBookmarked);

            let item = {
                tweeter: tweet.tweeter,
                id: tweet.id,
                tweetText: tweet.tweetText,
                tweetImg: tweet.tweetImg,
                isDeleted: tweet.isDeleted,
                userName: getUserDetail['name'],
                userImage: getUserDetail['profileImg'],
                date: tweetDate,
                likes: Number(getOriginalRetweetCountLikes[1]),
                isUserFollowing: following,
                isRetweet: !originality,
                retweeterAddress: tweet.retweeter,
                retweetCount: Number(getOriginalRetweetCountLikes[0]),
                originalID: originalTweetID,
                replyCount: Number(getOriginalReplyCount),
                isLikedByMe: hasLikedTweet,
                bookMarked: isTweetBookmarked
            };

            // Add a unique "key" using the tweet ID
            item.key = tweet.id;

            return item;
        }));


        // Filter out blocked tweets
        const filteredTweets = filterBlockedTweets(result);

        setTweets(filteredTweets.reverse());
        setLoadingState('loaded');


        // setTweets(result.reverse());
        // setLoadingState('loaded');


    }

    async function loadUserLikedTweets(userAddress) {

        console.log("IM IN loadUserLikedTweets");
        console.log("userAddress : " + userAddress);
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        console.log("signerAddress :" + signerAddress);

        if (userAddress == signerAddress) {
            loadMyLikedTweets();
        } else {

            const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);

            // Fetch the user's profile information
            let getUserDetail = await contract.getUser(userAddress);

            const data = await contract.getLikedTweetsForUser(userAddress);

            const result = await Promise.all(data.map(async tweet => {
                const unixTime = tweet.timestamp;
                const date = new Date(unixTime * 1000);
                const tweetDate = date.toLocaleDateString("fr-CH");

                let getOriginalRetweetCountLikes = await contract.getOriginalRetweetCountLikes(tweet.id);
                console.log("getOriginalRetweetCount : " + getOriginalRetweetCountLikes[0]);
                console.log("getOriginalLikes : " + getOriginalRetweetCountLikes[1]);

                let originality = await contract.checkOriginalStatus(tweet.id);
                let originalTweetID;

                if (originality) {
                    originalTweetID = tweet.id;
                } else {
                    originalTweetID = tweet.originalTweetID;
                }

                let getOriginalReplyCount = await contract.getReplyCount(originalTweetID);
                console.log("getOriginalReplyCount : " + getOriginalReplyCount);

                let hasLikedTweet = await contract.hasLikedTweet(signerAddress, originalTweetID);
                setHasLikedTweet(hasLikedTweet);
                console.log("hasLikedTweet : " + hasLikedTweet);

                const contract2 = new ethers.Contract(TwitterContractAddress2, TwitterAbi2.abi, signer);

                const isTweetBookmarked = await contract2.isTweetBookmarked(signerAddress, originalTweetID); console.log("isTweetBookmarked Up: " + isTweetBookmarked);

                let item = {
                    tweeter: tweet.tweeter,
                    id: tweet.id,
                    tweetText: tweet.tweetText,
                    tweetImg: tweet.tweetImg,
                    isDeleted: tweet.isDeleted,
                    userName: getUserDetail['name'],
                    userImage: getUserDetail['profileImg'],
                    date: tweetDate,
                    likes: Number(getOriginalRetweetCountLikes[1]),
                    isUserFollowing: following,
                    isRetweet: !originality,
                    retweeterAddress: tweet.retweeter,
                    retweetCount: Number(getOriginalRetweetCountLikes[0]),
                    originalID: originalTweetID,
                    replyCount: Number(getOriginalReplyCount),
                    isLikedByMe: hasLikedTweet,
                    bookMarked: isTweetBookmarked
                };

                // Add a unique "key" using the tweet ID
                item.key = tweet.id;
                return item;
            }));

            // Filter out blocked tweets
            const filteredTweets = filterBlockedTweets(result);

            setTweets(filteredTweets.reverse());
            setLoadingState('loaded');
        }

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

                let isRetweetByUser = await contract.isRetweetByUser(tweet.id, userAddress);

                let getOriginalRetweetCountLikes = await contract.getOriginalRetweetCountLikes(tweet.id);
                console.log("getOriginalRetweetCount : " + getOriginalRetweetCountLikes[0]);
                console.log("getOriginalLikes : " + getOriginalRetweetCountLikes[1]);

                let originality = await contract.checkOriginalStatus(tweet.id);
                let originalTweetID;

                if (originality) {
                    originalTweetID = tweet.id;
                } else {
                    originalTweetID = tweet.originalTweetID;
                }

                let getOriginalReplyCount = await contract.getReplyCount(originalTweetID);
                console.log("getOriginalReplyCount : " + getOriginalReplyCount);

                let hasLikedTweet = await contract.hasLikedTweet(signerAddress, originalTweetID);
                setHasLikedTweet(hasLikedTweet);
                console.log("hasLikedTweet : " + hasLikedTweet);

                const contract2 = new ethers.Contract(TwitterContractAddress2, TwitterAbi2.abi, signer);

                const isTweetBookmarked = await contract2.isTweetBookmarked(signerAddress, originalTweetID); console.log("isTweetBookmarked Up: " + isTweetBookmarked);

                let item = {
                    tweeter: tweet.tweeter,
                    id: tweet.id,
                    tweetText: tweet.tweetText,
                    tweetImg: tweet.tweetImg,
                    isDeleted: tweet.isDeleted,
                    userName: getUserDetail['name'],
                    userImage: getUserDetail['profileImg'],
                    date: tweetDate,
                    isRetweet: isRetweetByUser,

                    likes: Number(getOriginalRetweetCountLikes[1]),
                    isUserFollowing: following,
                    // isRetweet: !originality,
                    retweeterAddress: tweet.retweeter,
                    retweetCount: Number(getOriginalRetweetCountLikes[0]),
                    originalID: originalTweetID,
                    replyCount: Number(getOriginalReplyCount),
                    isLikedByMe: hasLikedTweet,
                    bookMarked: isTweetBookmarked
                };

                // Add a unique "key" using the tweet ID
                item.key = tweet.id;
                return item;
            }));

            //  handleUserClick(userAddress);

            //setTweets(result.reverse());
            //setLoadingState('loaded');

            // Filter out blocked tweets
            const filteredTweets = filterBlockedTweets(result);

            setTweets(filteredTweets.reverse());
            setLoadingState('loaded');
        }

    }

    async function loadMyFollowingTweets() {
        setHomeOrFollowing(true);
        try {
            console.log("IM IN loadMyFollowingTweets");
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            let provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();
            console.log("signerAddress :" + signerAddress);

            const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);


            // const data = await contract.getFollowingTweets();

            // Call the function in your smart contract that retrieves tweets from the users you are following
            const followingTweets = await contract.getFollowingTweets(); // Adjust the function name accordingly

            const result = await Promise.all(followingTweets.map(async tweet => {
                const unixTime = tweet.timestamp;
                const date = new Date(unixTime * 1000);
                const tweetDate = date.toLocaleDateString("fr-CH");
                // Fetch the user's profile information
                let getUserDetail = await contract.getUser(tweet.tweeter);
                console.log("tweet.id : " + tweet.id);

                const following = await contract.isUserFollowing(signer.getAddress(), tweet.tweeter);
                console.log("following : " + following);

                let getOriginalRetweetCountLikes = await contract.getOriginalRetweetCountLikes(tweet.id);
                console.log("getOriginalRetweetCount : " + getOriginalRetweetCountLikes[0]);
                console.log("getOriginalLikes : " + getOriginalRetweetCountLikes[1]);

                let originality = await contract.checkOriginalStatus(tweet.id);
                let originalTweetID;

                if (originality) {
                    originalTweetID = tweet.id;
                } else {
                    originalTweetID = tweet.originalTweetID;
                }

                let getOriginalReplyCount = await contract.getReplyCount(originalTweetID);
                console.log("getOriginalReplyCount : " + getOriginalReplyCount);

                let hasLikedTweet = await contract.hasLikedTweet(signerAddress, originalTweetID);
                setHasLikedTweet(hasLikedTweet);
                console.log("hasLikedTweet : " + hasLikedTweet);

                const contract2 = new ethers.Contract(TwitterContractAddress2, TwitterAbi2.abi, signer);

                const isTweetBookmarked = await contract2.isTweetBookmarked(signerAddress, originalTweetID); console.log("isTweetBookmarked Up: " + isTweetBookmarked);

                let item = {
                    tweeter: tweet.tweeter,
                    id: tweet.id,
                    tweetText: tweet.tweetText,
                    tweetImg: tweet.tweetImg,
                    isDeleted: tweet.isDeleted,
                    userName: getUserDetail['name'],
                    userImage: getUserDetail['profileImg'],
                    date: tweetDate,
                    likes: Number(getOriginalRetweetCountLikes[1]),
                    isUserFollowing: following,
                    isRetweet: !originality,
                    retweeterAddress: tweet.retweeter,
                    retweetCount: Number(getOriginalRetweetCountLikes[0]),
                    originalID: originalTweetID,
                    replyCount: Number(getOriginalReplyCount),
                    isLikedByMe: hasLikedTweet,
                    bookMarked: isTweetBookmarked
                };

                // Add a unique "key" using the tweet ID
                item.key = tweet.id;
                return item;
            }));

            //  handleUserClick(userAddress);

            //setTweets(result.reverse());
            //setLoadingState('loaded');

            // Filter out blocked tweets
            const filteredTweets = filterBlockedTweets(result);

            setTweets(filteredTweets.reverse());
            setLoadingState('loaded');
        } catch (err) {
            console.log("err : " + err);
        }

    }

    async function reportTweets(reportedID) {
        try {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            let provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();
            console.log("signerAddress :" + signerAddress);
            const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer)
            const reportTweet = await contract.reportTweet(reportedID);

            await reportTweet.wait();
            notification({
                type: 'success',
                title: 'Reported Successfully. \n We will Check the Note',
                position: 'topR',
            });
        } catch (error) {
            notification({
                type: 'error',
                message: 'Failed to report user',
                title: 'Error',
                position: 'topR',
            });
        }

    }

    async function loadAllTweets() {
        setHomeOrFollowing(true);
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
            const following = await contract.isUserFollowing(signer.getAddress(), tweet.tweeter);



            let getOriginalRetweetCountLikes = await contract.getOriginalRetweetCountLikes(tweet.id);
            console.log("getOriginalRetweetCount : " + getOriginalRetweetCountLikes[0]);
            console.log("getOriginalLikes : " + getOriginalRetweetCountLikes[1]);

            let originality = await contract.checkOriginalStatus(tweet.id);
            let originalTweetID;

            if (originality) {
                originalTweetID = tweet.id;
            } else {
                originalTweetID = tweet.originalTweetID;
            }

            let getOriginalReplyCount = await contract.getReplyCount(originalTweetID);
            console.log("getOriginalReplyCount : " + getOriginalReplyCount);

            let hasLikedTweet = await contract.hasLikedTweet(signerAddress, originalTweetID);
            setHasLikedTweet(hasLikedTweet);
            console.log("hasLikedTweet : " + hasLikedTweet);

            const contract2 = new ethers.Contract(TwitterContractAddress2, TwitterAbi2.abi, signer);

            const isTweetBookmarked = await contract2.isTweetBookmarked(signerAddress, originalTweetID); console.log("isTweetBookmarked Up: " + isTweetBookmarked);

            let item = {
                tweeter: tweet.tweeter,
                id: tweet.id,
                tweetText: tweet.tweetText,
                tweetImg: tweet.tweetImg,
                isDeleted: tweet.isDeleted,
                userName: getUserDetail['name'],
                userImage: getUserDetail['profileImg'],
                date: tweetDate,
                likes: Number(getOriginalRetweetCountLikes[1]),
                isUserFollowing: following,
                isRetweet: !originality,
                retweeterAddress: tweet.retweeter,
                retweetCount: Number(getOriginalRetweetCountLikes[0]),
                originalID: originalTweetID,
                replyCount: Number(getOriginalReplyCount),
                isLikedByMe: hasLikedTweet,
                bookMarked: isTweetBookmarked
            };

            console.log("isTweetBookmarked Down: " + item.bookMarked);

            // Add a unique "key" using the tweet ID
            item.key = tweet.id;


            console.log("retweeter :" + item.retweeterAddress);

            return item;
        }));

        //setTweets(result.reverse());
        //setLoadingState('loaded');

        const filteredTweets = filterBlockedTweets(result);

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
            title: 'Note Deleted Successfully',
            position: 'topR',
            icon: <Bin />
        });

        loadMyTweets();

    }

    async function post(tweetID) {

        navigate(`/post/${tweetID}`/*, {
 
            state: {
                  tweetid : tweetID
            
              },
          }*/);
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
                title: 'Note liked Successfully',
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
    try {
        console.log("loadingState : " + loadingState);
        if (loadingState == 'not-loaded') return (
            <div className="loading">
                <Loading size={60} spinnerColor="#8247" />
            </div>
        )

        if (loadingState == 'loaded' && !tweets.length) return (
            <h1 className="loading">No Note Available</h1>
        )
    } catch (error) {
        console.log(error);
    }

    async function bookmark(tweetId, tweetOriginalID) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const contract2 = new ethers.Contract(TwitterContractAddress2, TwitterAbi2.abi, signer);
        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);

        try {

            let originality = await contract.checkOriginalStatus(tweetId);
            let originalTweetID;

            if (originality) {
                originalTweetID = tweetId;
            } else {
                originalTweetID = tweetOriginalID;
            }

            const isTweetBookmarked = await contract2.isTweetBookmarked(signerAddress, originalTweetID);

            if (!isTweetBookmarked) {
                // Call the contract function to follow the user
                const transaction = await contract2.bookmarkTweet(originalTweetID);
                await transaction.wait();
            } else {
                const removeBookmark = await contract2.removeBookmark(originalTweetID);
                await removeBookmark.wait();
            }


            notification({
                type: 'success',
                title: 'Notemarked Successfully',
                position: 'topR'
            });

            window.location.reload();

        } catch (error) {
            notification({
                type: 'error',
                title: 'Transaction Error',
                message: error.message,
                position: 'topR'
            });
        }
    }

    return (
        <>

            {
                tweets.map((tweet, i) => {
                    return (
                        <div className="background">

                            {tweet.isRetweet ? (<div className="reNote"><Webhook color="#d62c56" fontSize={18} />Re-noted {homeOrFollowing ? <Link to={`/profile/${tweet.retweeterAddress}`}><span className="reNote2">By {tweet.retweeterAddress.slice(0, 3) + "..." + tweet.retweeterAddress.slice(39, 42)}</span></Link> : null}</div>) : null}

                            <div onClick={() => post(tweet.originalID)} className="FeedTweet" key={i}>
                                <div><Avatar onClick={(e) => { e.stopPropagation(); handleUserClick(tweet.tweeter) }} isRounded image={tweet.userImage} theme="image" className="avatar" /></div>
                                <div className="completeTweet">

                                    <div className="who">
                                        <div>
                                            <div className="nameDate">
                                                <div className="user--1" onClick={(e) => { e.stopPropagation(); handleUserClick(tweet.tweeter) }}>{tweet.userName}</div>
                                                <div className="interactionNums2" onClick={(e) => { e.stopPropagation(); }}><Calendar color="#b8b8b8" fontSize={18} />{tweet.date}</div>
                                            </div>
                                            <div></div>
                                            <div className="accWhen" onClick={(e) => { e.stopPropagation(); handleUserClick(tweet.tweeter) }}>{tweet.tweeter}</div>
                                        </div>
                                        {tweet.tweeter !== _signerAddress && (
                                            <div className="dropdown" onClick={(e) => toggleDropdown(e)}>
                                                <div className="moreDiv"><More theme="image" size={60} /></div>
                                                {isDropdownOpen && (
                                                    <div className="dropdown-content">
                                                        <div onClick={() => blockTweet(tweet.id)}> <Frown size={30} /> Not interested in this post</div>
                                                        <div>
                                                            {tweet.isUserFollowing ? (
                                                                <span onClick={() => unfollowUser(tweet.tweeter)}>
                                                                    <AddUser color="red" size={30} /> Unfollow
                                                                </span>
                                                            ) : (
                                                                <span onClick={() => followUserDropDown(tweet.tweeter)}>
                                                                    <AddUser size={30} /> Follow
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div onClick={() => blockUser(tweet.tweeter)}><Ban size={30} /> Block {tweet.userName}</div>
                                                        <div onClick={() => reportTweets(tweet.id)}><Event size={30} /> Report post {tweet.userName}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="tweetContent">
                                        {(tweet.tweetText.split('|@|')).map((sentence, index) => (
                                            <div key={index}>{sentence}</div>
                                        ))}
                                        {tweet.tweetImg !== '' && (
                                            <img src={tweet.tweetImg} className="tweetImg" />
                                        )}
                                    </div>
                                    <div className="interactions">
                                        <div className="interactionNums" onClick={(e) => { e.stopPropagation(); post(tweet.originalID) }}><MessageCircle color="#b8b8b8" fontSize={20} />{tweet.replyCount}</div>
                                        <div className="interactionNums" onClick={(e) => { e.stopPropagation(); createReNote(tweet.id) }}><Webhook color="#b8b8b8" fontSize={20} />{tweet.retweetCount}</div>
                                        {tweet.isLikedByMe ?
                                            (<div className="interactionNums" onClick={(e) => { e.stopPropagation(); likeTweet(tweet.id) }}><HeartFilled color="#911d3a" fontSize={20} />{tweet.likes}</div>) :
                                            (<div className="interactionNums" onClick={(e) => { e.stopPropagation(); likeTweet(tweet.id) }}><Heart color="#b8b8b8" fontSize={20} />{tweet.likes}</div>)}

                                        {tweet.bookMarked ?
                                            (

                                                <div className="interactionNums" onClick={(e) => { e.stopPropagation(); bookmark(tweet.id, tweet.originalID) }}><Paperclip color="#911d3a" fontSize={20} /></div>

                                            ) :
                                            (<div className="interactionNums" onClick={(e) => { e.stopPropagation(); bookmark(tweet.id, tweet.originalID) }}><Paperclip color="#b8b8b8" fontSize={20} /></div>)
                                        }

                                        <div>{onlyUser ? <div className="interactionNums"><Bin fontSize={20} color="#FF0000" onClick={(e) => { e.stopPropagation(); deleteTweet(tweet.id) }} /></div> :
                                            <div className="interactionNums" onClick={(e) => { e.stopPropagation(); sendMaticWithTip(tweet.tweeter) }}>
                                                <span class="initialText"><HandCoin className="icon" color="#911d3a" fontSize={20} />Tip</span>
                                                <span class="hoverText"><Matic className="icon" fontSize={20} />0.02</span>

                                            </div>}
                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>
                    );
                })
            }


        </>
    );
}

export default TweetInFeed;