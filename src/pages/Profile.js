import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";
import { defaultImgs } from "../defaultImgs";
import TweetInFeed from "../components/TweetInFeed";
import { Matic, More } from "@web3uikit/icons";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import { TwitterContractAddress } from '../config';
import TwitterAbi from '../abi/Twitter.json';

const Profile = () => {

    const activeAccount = JSON.parse(localStorage.getItem("activeAccount"));
    console.log("activeAccount :" + activeAccount);
    const userName = JSON.parse(localStorage.getItem("userName"));
    const userBio = JSON.parse(localStorage.getItem("userBio"));
    const userImage = JSON.parse(localStorage.getItem("userImage"));
    const userBanner = JSON.parse(localStorage.getItem("userBanner"));
    const [accountBalance, setAccountBalance] = useState(0);
    const navigate = useNavigate();
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const [followingStatus, setFollowingStatus] = useState(isFollowingUser);
    const [followingCount, setFollowingCount] = useState(0);
    const [followersCount, setFollowersCount] = useState(0);
    const [_signer, setSigner] = useState();
    const [userProfileAddress, setUserProfileAddress] = useState('');

    async function getAccountBalance() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        let balance = await provider.getBalance(activeAccount);
        balance = ethers.utils.formatEther(balance).substring(0, 4);
        setAccountBalance(balance);
    }

    async function navigateToProfile() {

        navigate(`/user/MyLikes`/*, {

            state: {
                likePageActivate: true,
            },
        }*/);

    }


    useEffect(() => {
        const checkIsFollowing = async () => {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            let provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            setSigner(signer);

            const walletAddress = signer.getAddress();

            setUserProfileAddress(walletAddress);
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

    async function navigateToProfileReplies() {

        navigate(`/replies/`);
    }

    return (
        <>
            <img className="profileBanner" src={userBanner} />
            <div className="pfpContainer">
                <img className="profilePFP" src={userImage} />
                <div className="profileName">{userName}</div>
                <div className="profileWallet">{activeAccount}</div><div className="profileWallet"><Matic />{Number(accountBalance).toFixed(2)} MATIC</div>
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
                        <div className="profileTab">My Notes</div>
                    </div>
                    <div className="profileTabs">
                        <div className="profileTabL" onClick={navigateToProfileReplies}>Replies</div>
                    </div>
                    <div className="profileTabs">
                        <div className="profileTabL" onClick={navigateToProfile}>Likes</div>
                    </div>
                </div>
            </div>

            <TweetInFeed profile={true} userProfile={false} ></TweetInFeed>
        </>
    );
}

export default Profile;