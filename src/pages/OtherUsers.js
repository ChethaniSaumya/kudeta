import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./user.css";
import { defaultImgs } from "../defaultImgs";
import TweetInFeed from "../components/TweetInFeed";
import { Matic, More, Mail } from "@web3uikit/icons";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import { useParams } from 'react-router-dom'; // Import useParams
import { TwitterContractAddress } from '../config';
import TwitterAbi from '../abi/Twitter.json';
import { Button, useNotification, Loading } from '@web3uikit/core';

const Users = () => {

    const { _userWalletAddress } = useParams(); // Extract the username from the URL
    const activeAccount = _userWalletAddress;
    console.log("activeAccount : " + activeAccount);
    const [userName, setUserName] = useState('');
    const [userBio, setUserBio] = useState('');
    const [userImage, setUserImage] = useState('');
    const [userBanner, setUserBanner] = useState('');
    const [accountBalance, setAccountBalance] = useState(0);
    const notification = useNotification();
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const [followingStatus, setFollowingStatus] = useState(isFollowingUser);
    const [followingCount, setFollowingCount] = useState(0);
    const [followersCount, setFollowersCount] = useState(0);
    const [_signer, setSigner] = useState();
    const [userProfileAddress, setUserProfileAddress] = useState('');
    const navigate = useNavigate();

    async function getAccountBalance() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        let balance = await provider.getBalance(_userWalletAddress);
        balance = ethers.utils.formatEther(balance).substring(0, 4);
        setAccountBalance(balance);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);
        let userDetail = await contract.getUser(_userWalletAddress);

        console.log("userDetail : " + userDetail['name']);
        // Set the user's profile information
        let _userName = userDetail['name'];
        let _userBio = userDetail['bio'];
        let _userImage = userDetail['profileImg'];
        let _userBanner = userDetail['profileBanner'];

        setUserName(_userName);
        setUserBio(_userBio);
        setUserImage(_userImage);
        setUserBanner(_userBanner);
        console.log("_userName : " + _userName);
        console.log("_userBio : " + _userBio);
        console.log("_userImage : " + _userImage);
        console.log("_userBanner : " + _userBanner);
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
        };

        console.log("userProfileAddress : " + userProfileAddress);

        checkIsFollowing();
        getAccountBalance();

    }, [activeAccount]);

    async function navigateToProfile() {

        navigate(`/user/MyLikes`/*, {

            state: {
                likePageActivate: true,
            },
        }*/);

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

    async function navigateToProfileReplies() {

        if (_userWalletAddress != userProfileAddress) {
            navigate(`/replies/${_userWalletAddress}` /* ), {
 
           state: {
                 userName : userName,
                 userBio : userBio,
                 userImage : userImage,
                 userBanner : userBanner
             },
         }*/);
        } else {
            navigate(`/replies/` /* ), {
 
                state: {
                      userName : userName,
                      userBio : userBio,
                      userImage : userImage,
                      userBanner : userBanner
                  },
              }*/);
        }

    }

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
                <div className="profileWallet">{activeAccount} </div><div className="profileWallet"><Matic />{Number(accountBalance).toFixed(2)} MATIC</div>
                <div className="flexDiv">
                    <div className="profileWallet">{`Following: ${followingCount}`}</div>
                    <div className="profileWallet">{`Followers: ${followersCount}`}</div>
                </div>
                <div className="profileBio">{userBio}</div>
                <div className="profileTabsMain">
                    <div className="profileTabs">
                        <div className="profileTab">Notes</div>
                    </div>
                    <div className="profileTabs">
                        <div className="profileTabL" onClick={navigateToProfileReplies}>Replies</div>
                    </div>
                    <div className="profileTabs">
                        <div className="profileTabL" onClick={navigateToProfileLikes}>Likes</div>
                    </div>
                </div>
            </div>
            <TweetInFeed userProfile={true} userWallet={activeAccount}></TweetInFeed>
        </>
    );
}

export default Users;