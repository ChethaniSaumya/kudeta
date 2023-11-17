import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Profile.css";
import { defaultImgs } from "../defaultImgs";
import TweetReplies from "../components/TweetReplies";
import Profile from "./Profile";
import { Matic, More } from "@web3uikit/icons";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import { TwitterContractAddress } from '../config';
import TwitterAbi from '../abi/Twitter.json';
import { Button, useNotification, Loading } from '@web3uikit/core';

//import { useLocation } from 'react-router-dom';

const MyReplies = () => {


    const activeAccount = JSON.parse(localStorage.getItem("activeAccount"));
    console.log("activeAccount :" + activeAccount);
    const userName = JSON.parse(localStorage.getItem("userName"));
    const userBio = JSON.parse(localStorage.getItem("userBio"));
    const userImage = JSON.parse(localStorage.getItem("userImage"));
    const userBanner = JSON.parse(localStorage.getItem("userBanner"));

    // const [userName, setUserName] = useState('');
    // const [userBio, setUserBio] = useState('');
    //  const [userImage, setUserImage] = useState('');
    //  const [userBanner, setUserBanner] = useState('');
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

    //...............................................//

    async function getAccountBalance() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        let balance = await provider.getBalance(activeAccount);
        balance = ethers.utils.formatEther(balance).substring(0, 4);
        const signer = provider.getSigner();
        const walletAddress = await signer.getAddress();

        console.log("walletAddress : " + activeAccount);
        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);
        let userDetail = await contract.getUser(activeAccount);

        let _userName = userDetail['name'];
        let _userBio = userDetail['bio'];
        let _userImage = userDetail['profileImg'];
        let _userBanner = userDetail['profileBanner'];

        // setUserName(_userName);
        //  setUserBio(_userBio);
        // setUserImage(_userImage);
        // setUserBanner(_userBanner);

        setAccountBalance(balance);

    }

    async function navigateToProfileLikes() {

        navigate(`/user/MyLikes` /* ), {
 
                state: {
                      userName : userName,
                      userBio : userBio,
                      userImage : userImage,
                      userBanner : userBanner
                  },
              }*/);
    }


    async function navigateToMyProfile() {

        navigate(`/profile/`);
    }

    useEffect(() => {
        const checkIsFollowing = async () => {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            let provider = new ethers.providers.Web3Provider(connection);

            const signer = provider.getSigner();
            setSigner(signer);

            setUserProfileAddress(await signer.getAddress());
            const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);

            const count1 = await contract.getFollowersCount(activeAccount);
            setFollowersCount(Number(count1));
            console.log("count1 : " + count1);

            const count2 = await contract.getFollowingsCount(activeAccount);
            setFollowingCount(Number(count2));
            console.log("count2 : " + count2);

            console.log("userProfileAddress CHECK : " + activeAccount);
        };


        const fetchReplies = async () => {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            let provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();
            setSignerAddress(signerAddress);
            const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer)
            try {

                // Assuming your contract has a method called `getReplies` to fetch replies
                const replyData = await contract.getMyReplies(signerAddress);

                console.log("signerAddress :" + signerAddress);
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

        getAccountBalance();
        checkIsFollowing();
        fetchReplies();
    }, []);

    return (
        <>
            <img className="profileBanner" src={userBanner} />

            <div className="pfpContainer">

                <img className="profilePFP" src={userImage} />

                <div className="profileName">{userName}</div>
                <div className="profileWallet">{userProfileAddress}</div><div className="profileWallet"><Matic />{Number(accountBalance).toFixed(2)} MATIC</div>
                <div className="flexDiv">
                    <div className="profileWallet">{`Following: ${followingCount}`}</div>
                    <div className="profileWallet">{`Followers: ${followersCount}`}</div>
                </div>
                <Link to='/settings'>
                    <div className="profileEdit">Edit Profile</div>
                </Link>
                <div className="profileBio">{userBio}</div>

                <div className="profileTabsMain">
                    <div className="profileTabs">
                        <div className="profileTabL" onClick={navigateToMyProfile}>My Notes</div>
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

export default MyReplies;