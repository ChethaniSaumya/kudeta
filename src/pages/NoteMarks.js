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

const NoteMarks = () => {

    const [_signer, setSigner] = useState();
    const [activeAccount, setActiveAccount] = useState();
    const [userProfileAddress, setUserProfileAddress] = useState('');
    const navigate = useNavigate();

    useEffect(() => {

        const walletConnect = async () => {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            let provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            setSigner(signer);

            setUserProfileAddress(signer.getAddress());
        };

        console.log("userProfileAddress : " + userProfileAddress);

        walletConnect();

    }, []);

    return (
        <>
            <TweetInFeed notemarks={true}></TweetInFeed>
        </>
    );
}

export default NoteMarks;