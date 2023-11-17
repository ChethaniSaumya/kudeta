import React, { useState, useEffect } from "react";
import './Sidebar.css';
import { Twitter, Home, User, Cog } from '@web3uikit/icons';
import { Link } from 'react-router-dom';
import logo from '../images/KUDETA.png';
import { Avatar } from "@web3uikit/core";
import { TwitterContractAddress, Web3StorageApi } from '../config';
import TwitterAbi from '../abi/Twitter.json';
import { ethers } from 'ethers';
import Web3Modal from "web3modal";

const Footer = (props) => {

    const [_signerAddress, setSignerAddress] = useState('');
    const [userName, setUserName] = useState('');
    //sconst userName = JSON.parse(localStorage.getItem('userName'));
    const [userImage, setUserImage] = useState('');
    const [loadingState, setLoadingState] = useState('not-loaded');
    let reloadComponent = props.reload;

    async function myDetails() {

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        setSignerAddress(signerAddress);
        console.log("signerAddress :" + signerAddress);
        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);
       // const data = await contract.getMyTweets();

        // Fetch the user's profile information
        let getUserDetail = await contract.getUser(signerAddress);

        setUserName(getUserDetail['name']);
        setUserImage(getUserDetail['profileImg']);
    }

    useEffect(() => {
        myDetails();
    }, [reloadComponent]);

 
    return (
        <>
            <div className='footerContent'>
                <div className='menu2'>
                    <img class="logo2" src={logo} />

                    <div><Avatar isRounded image={userImage} theme="image" className="avatar" /></div>

                    <Link to="/" className='link'>
                        <div className='menuItems'>
                            <Home className="icons" /> <span className='span'>Home</span>
                        </div>
                    </Link>

                    <Link to="/profile" className='link'>
                        <div className='menuItems'>
                            <User className="icons" /> <span className='span'>Profile</span>
                        </div>
                    </Link>

                    <Link to="/settings" className='link'>
                        <div className='menuItems'>
                            <Cog className="icons" /> <span className='span'>Settings</span>
                        </div>
                    </Link>

                    <Link to="/note" className='link'>
                        <button class="note">Note</button>
                    </Link>

                </div>
            </div>
        </>
    );
}

export default Footer;