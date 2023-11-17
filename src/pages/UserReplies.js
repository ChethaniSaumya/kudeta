import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Profile.css";
import { defaultImgs } from "../defaultImgs";
import TweetReplies from "../components/TweetReplies";
import Profile from "./Profile";
import { Matic, Mail } from "@web3uikit/icons";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import { TwitterContractAddress } from '../config';
import TwitterAbi from '../abi/Twitter.json';
import { Button, useNotification, Loading } from '@web3uikit/core';

//import { useLocation } from 'react-router-dom';

const UserReplies = () => {

    const { _userWalletAddress } = useParams();


    const [likePageActivate, setLikePageActivate] = useState(false);

    const activeAccount = _userWalletAddress;
    const [userName, setUserName] = useState('');
    const [userBio, setUserBio] = useState('');
    const [userImage, setUserImage] = useState('');
    const [userBanner, setUserBanner] = useState('');
    const [accountBalance, setAccountBalance] = useState(0);

    const navigate = useNavigate();
    const [followingCount, setFollowingCount] = useState(0);
    const [followersCount, setFollowersCount] = useState(0);
    const [_signer, setSigner] = useState();
    const [userProfileAddress, setUserProfileAddress] = useState('');
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const [replies, setReplies] = useState([]);

    //...............................................//


    const [_signerAddress, setSignerAddress] = useState('');

    const [tweets, setTweets] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');
    const [contractTwitter, setcontract] = useState('');
    const [tweeter, setTweeter] = useState('');
    const [id, setid] = useState('');
    const [tweetImg, setTweetImg] = useState('');
    const [isDeleted, setIsDeleted] = useState('');
    const [tweetText, setTweetText] = useState('');
    const [date, setTweetDate] = useState('');
    const [tweetLikes, setTweetLikes] = useState(0);

    const [selectedImage, setSelectedImage] = useState();
    //const inputFile = useRef(null);
    const [replyTxt, setReplyTxt] = useState('');
    const [uploading, setUploading] = useState(false);
    let ipfsUploadedUrl = '';
    const [selectedFile, setSelectedFile] = useState();
    const [loading, setNewLoadingState] = useState(false);
    const [receivingWallet, setReceivingWallet] = useState('');
    const [followingStatus, setFollowingStatus] = useState(isFollowingUser);
    const notification = useNotification();
    //...............................................//

    async function getAccountBalance() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        let balance = await provider.getBalance(activeAccount);
        balance = ethers.utils.formatEther(balance).substring(0, 4);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);
        let userDetail = await contract.getUser(_userWalletAddress);

        let _userName = userDetail['name'];
        let _userBio = userDetail['bio'];
        let _userImage = userDetail['profileImg'];
        let _userBanner = userDetail['profileBanner'];

        setUserName(_userName);
        setUserBio(_userBio);
        setUserImage(_userImage);
        setUserBanner(_userBanner);

        setAccountBalance(balance);

    }

    async function navigateToProfileLikes() {

        if (_userWalletAddress != userProfileAddress) {
            navigate(`/likes/${_userWalletAddress}` /* ), {
 
           state: {
                 userName : userName,
                 userBio : userBio,
                 userImage : userImage,
                 userBanner : userBanner
             },
         }*/);
        } else {
            navigate(`/likes/` /* ), {
 
                state: {
                      userName : userName,
                      userBio : userBio,
                      userImage : userImage,
                      userBanner : userBanner
                  },
              }*/);
        }

    }


    async function navigateToUserProfile() {
        if (_userWalletAddress != userProfileAddress) {

            console.log("I'm here 1 :" + _userWalletAddress);
            navigate(`/profile/${_userWalletAddress}` /* ), {
 
           state: {
                 userName : userName,
                 userBio : userBio,
                 userImage : userImage,
                 userBanner : userBanner
             },
         }*/);
        } /*else {
            console.log("I'm here 2");

            navigate(`/profile/` /* ), {
 
                state: {
                      userName : userName,
                      userBio : userBio,
                      userImage : userImage,
                      userBanner : userBanner
                  },
              });
        }*/


    }

    async function unfollowUser() {
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

    useEffect(() => {
        const checkIsFollowing = async () => {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            let provider = new ethers.providers.Web3Provider(connection);

            const signer = provider.getSigner();
            setSigner(signer);

            setUserProfileAddress(signer.getAddress());
            const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);
            const following = await contract.isUserFollowing(signer.getAddress(), activeAccount);
            setIsFollowingUser(following);

            const count1 = await contract.getFollowersCount(activeAccount);
            setFollowersCount(Number(count1));
            console.log("count1 : " + count1);

            const count2 = await contract.getFollowingsCount(activeAccount);
            setFollowingCount(Number(count2));
            console.log("count2 : " + count2);

            console.log("userProfileAddress CHECK : " + userProfileAddress);
        };


        const fetchReplies = async () => {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            let provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();
            setSignerAddress(signerAddress);
            const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer)
            setcontract(contract);
            try {

                // Assuming your contract has a method called `getReplies` to fetch replies
                const replyData = await contract.getMyReplies(_userWalletAddress);

                console.log("_userWalletAddress :" + _userWalletAddress);
                console.log("replyData :" + replyData);



                const result = await Promise.all(replyData[0].map(async (replyTweet, index) => {
                    /*   const unixTime = tweet.timestamp;
                       const date = new Date(unixTime * 1000);
                       const tweetDate = date.toLocaleDateString("fr-CH");
   */
                    const tweetId = replyData[1][index]; // Get the associated tweet ID
                    let getUserDetail = await contract.getUser(replyTweet[0]);


                    let item = {
                        tweeter: replyTweet[0],
                        // id: replyTweet.id,
                        tweetId: tweetId,
                        tweetText: replyTweet[1],
                        tweetImg: replyTweet[2],
                        userName: getUserDetail['name'],
                        userImage: getUserDetail['profileImg'],
                        date: replyTweet[3],
                        date2: replyTweet.date,
                    };

                    // Add a unique "key" using the tweet ID
                    //item.key = tweet.id;
                    return item;
                }));


                // Process the replyData and set it in the state
                setReplies(result);

            } catch (error) {
                console.error("Error fetching replies:", error);
            }

        };

        console.log("userProfileAddress : " + userProfileAddress);

        checkIsFollowing();
        getAccountBalance();

        fetchReplies();
    }, [activeAccount, _userWalletAddress]);

    async function userMsg() {

        // Navigate to the Messages page with state
        navigate(`/selected-user-msgs/${_userWalletAddress}`);
    }

    return (
        <>
            <img className="profileBanner" src={userBanner} />

            <div className="pfpContainer">

                <div className="followDiv">
                    <img className="profilePFP" src={userImage} />

                    <div className="followDiv2">
                        <div className="more">
                            {/* ... (More component) */}
                        </div>
                        <div className="more">
                            <Mail fill="white" className="icons2" onClick={userMsg} size={40}></Mail>
                        </div>

                        <div className="followUnfollow">
                            {isFollowingUser ? (
                                // Button for when isFollowingUser is true
                                <div
                                    className="followBtn2 following"
                                    onClick={unfollowUser}
                                >
                                    Following
                                </div>
                            ) : (
                                // Button for when isFollowingUser is false
                                <div
                                    className="followBtn"
                                    onClick={followUser}
                                >
                                    Follow
                                </div>
                            )}
                        </div>



                    </div>
                </div>

                <div className="profileName">{userName}</div>
                <div className="profileWallet">{activeAccount}</div><div className="profileWallet"><Matic />{Number(accountBalance).toFixed(2)} MATIC</div>
                <div className="flexDiv">
                    <div className="profileWallet">{`Following: ${followingCount}`}</div>
                    <div className="profileWallet">{`Followers: ${followersCount}`}</div>
                </div>
                <div className="profileBio">{userBio}</div>

                <div className="profileTabsMain">
                    <div className="profileTabs">
                        <div className="profileTabL" onClick={navigateToUserProfile}>Notes</div>
                    </div>
                    <div className="profileTabs">
                        <div className="profileTab">Replies</div>
                    </div>
                    <div className="profileTabs">
                        <div className="profileTabL" onClick={navigateToProfileLikes}>Likes</div>
                    </div>
                </div>
            </div>

            <TweetReplies replies={replies} />
        </>
    );
}

export default UserReplies;