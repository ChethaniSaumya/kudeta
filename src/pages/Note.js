import React, { useState, useRef } from "react";
//import { Link } from "react-router-dom";
import "./Home.css";
import { Avatar, Loading, useNotification } from "@web3uikit/core";
import { Image } from '@web3uikit/icons';
import { defaultImgs } from '../defaultImgs';
import Home from "../pages/Home";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import { TwitterContractAddress, Web3StorageApi } from '../config';
import TwitterAbi from '../abi/Twitter.json';
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js';
import { Link, useNavigate } from "react-router-dom";
 
const Note = () => {

    const Web3StorageApi = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGFBNzVBNzJENEM3ODFhNzhBMEMyODZjZWViZUMwODBhODI0NDNCNjciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTcxMzcyOTI5MDYsIm5hbWUiOiJUd2l0dGVyQVBJIn0.Bt_AyVqdv50PIZ-liMRjBsELi_E78iHBhn9N72JadvI";
    const inputFile = useRef(null);
    const [selectedImage, setSelectedImage] = useState();
    const [tweetText, setTweetText] = useState('');
    const userImage = JSON.parse(localStorage.getItem('userImage'));
    const [selectedFile, setSelectedFile] = useState();
    const [uploading, setUploading] = useState(false);
    let ipfsUploadedUrl = '';
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [contractTwitter, setcontract] = useState('');
    const notification = useNotification();
    const navigate = useNavigate();

    async function storeFile() {
        const client = new Web3Storage({ token: Web3StorageApi });
        const rootCid = await client.put(selectedFile);
        ipfsUploadedUrl = `https://${rootCid}.ipfs.dweb.link/${selectedFile[0].name}`;
    }

    const onImageClick = () => {
        inputFile.current.click();
    }

    const changeHandler = (event) => {
        const imgFile = event.target.files[0];
        setSelectedImage(URL.createObjectURL(imgFile));
        setSelectedFile(event.target.files);
    }

    async function addTweet() {

        console.log("tweetText : " + tweetText);
        if (tweetText.trim().length < 5) {
            notification({
                type: 'warning',
                message: 'Minimum 5 characters',
                title: 'Tweet Field Required',
                position: 'topR'
            });
            return;
        }

        const sentences = tweetText.split('\n'); // Split by line breaks

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

            const transaction = await contract.addTweet(combinedSentences, ipfsUploadedUrl/*,{value:price}*/);
            await transaction.wait();

            notification({
                type: 'success',
                title: 'Tweet Added Successfully',
                position: 'topR'
            });


            setSelectedImage(null);
            setTweetText('');
            setSelectedFile(null);
            setUploading(false);

            navigate('/');

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

    return (
        <>
            <div className="mainContent">

                <div>
                    <div class="formMain1">
                        <div class="formMain">
                            <form>

                                <Link to="/" className='link'>
                                    <button class="closeNote">✖</button>
                                </Link>

                            </form>
                            <div className="profileTweet">
                                <div className="tweetSection">
                                   <div><Avatar isRounded image={userImage} theme="image" size={60} /></div>
                                    <textarea value={tweetText} name="TweetTxtArea" placeholder=" What's going on ?" className="textArea" onChange={(e) => setTweetText(e.target.value)}></textarea>
                                </div>
                                <div className="tweetSection">
                                    <div className="imgDiv" onClick={onImageClick}>
                                        <input type="file" ref={inputFile} onChange={changeHandler} style={{ display: "none" }} />
                                        {selectedImage ? <img src={selectedImage} width={150} /> : <Image fontSize={25} fill="#ffffff" />}

                                    </div>
                                    <div className="tweet" onClick={addTweet}>{uploading ? <Loading /> : 'Note'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </>
    )
}

export default Note;