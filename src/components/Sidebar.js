import React, { useState, useEffect } from "react";
import './Sidebar.css';
import { Twitter, Home, User, Cog, Paperclip, Mail } from '@web3uikit/icons';
import { Link } from 'react-router-dom';
import logo from '../images/KUDETA.png';
import { TwitterContractAddress, Web3StorageApi } from '../config';
import TwitterAbi from '../abi/Twitter.json';
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import { Avatar } from "@web3uikit/core";

const Sidebar = (props) => {

    const [showPopup, setShowPopup] = useState(false);
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

    const togglePopup = () => {
        setShowPopup(!showPopup);
    }

    const file1 = () => {
        window.open("../../public/Privacy Policy for Rednote.io.pdf");
    }

    const file2 = () => {
        window.open("../../public/Terms of Service for Rednote.io.pdf");
    }

    const file3 = () => {
        window.open("../../public/Disclaimer for Rednote.io.pdf");
    }

    return (
        <>
            <div className='siderContent'>
                <div className='menu'>
                    <div className='details'>
                        <img class="logo2" src={logo} />
                    </div>
                    <div className='detailsM'>
                        <span className='redM'>R</span>N
                    </div>

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

                    <Link to="/notemarks" className='link'>
                        <div className='menuItems'>
                            <Paperclip className="icons" /> <span className='span'>Notemarks</span>
                        </div>
                    </Link>

                    <Link to="/messages" className='link'>
                        <div className='menuItems'>
                            <Mail className="icons" /> <span className='span'>Messages</span>
                        </div>
                    </Link>

                    <Link to="/note" className='link'>
                        <button class="note">Note</button>
                    </Link>


                    <div className="userDetails">
                        <div><Avatar isRounded image={userImage} theme="image" className="avatar" /></div>

                        <div class="userDetails2">
                            <div className="userName">{userName}</div>
                            <div className="userAddress">{_signerAddress.slice(0, 3) + "..." + _signerAddress.slice(39, 42)}</div>
                        </div>
                    </div>

                    <div className="termsMain">
                        <Link to={'/privacy-policy'}>
                        <div className="terms">Privacy Policy</div>
                        </Link>
                        <Link to={'/terms-of-services'}>
                        <div className="terms">Terms of service</div>
                        </Link>
                        <Link to={'/disclaimer'}>
                        <div className="terms">Disclaimer</div>
                        </Link>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Sidebar;