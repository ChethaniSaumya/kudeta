import React, { useState, useEffect } from "react";
import "./Settings.css";
import { Input, Upload, Loading, useNotification } from "@web3uikit/core";
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js';
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import { TwitterContractAddress, Web3StorageApi } from '../config';
import TwitterAbi from '../abi/Twitter.json';
import { Link, useNavigate } from 'react-router-dom';

const Settings = () => {

    const Web3StorageApi = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGFBNzVBNzJENEM3ODFhNzhBMEMyODZjZWViZUMwODBhODI0NDNCNjciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTcxMzcyOTI5MDYsIm5hbWUiOiJUd2l0dGVyQVBJIn0.Bt_AyVqdv50PIZ-liMRjBsELi_E78iHBhn9N72JadvI";

    const notification = useNotification();
    const userName = JSON.parse(localStorage.getItem("userName"));
    const userBio = JSON.parse(localStorage.getItem("userBio"));
    const userImage = JSON.parse(localStorage.getItem("userImage"));
    const userBanner = JSON.parse(localStorage.getItem("userBanner"));

    const [profileFile, setProfileFile] = useState();
    const [bannerFile, setBannerFile] = useState();
    const [name, setName] = useState(userName);
    const [bio, setBio] = useState(userBio);
    const [loading, setLoading] = useState(false);
    const [contractTwitter, setcontract] = useState('');
    const navigate = useNavigate();

    let profileUploadedUrl = userImage;
    let bannerUploadedUrl = userBanner;
    let ipfsUploadedUrl = '';

    async function storeFile(selectedFile) {
        const client = new Web3Storage({ token: Web3StorageApi });
        const rootCid = await client.put(selectedFile);
        let ipfsUploadedUrl = `https://${rootCid}.ipfs.dweb.link/${selectedFile[0].name}`;
        return ipfsUploadedUrl;
    }

    const bannerHandler = (event) => {
        if (event != null) {
            setBannerFile(event);
        }
    }

    const profileHandler = (event) => {
        if (event != null) {
            setProfileFile(event);
        }
    }   

    useEffect(() => {

    }, [loading]);



    async function updateProfile() {


        try {

            setLoading(true);


            if (profileFile != null) {
                let newProfileUploadedUrl = await storeFile([profileFile]);
                profileUploadedUrl = newProfileUploadedUrl;
            }

            if (bannerFile != null) {
                let newBannerUploadedUrl = await storeFile([bannerFile]);
                bannerUploadedUrl = newBannerUploadedUrl;
            }

            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            let provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer)
            const transaction = await contract.updateUser(name,bio,profileUploadedUrl,bannerUploadedUrl);
            await transaction.wait();

            window.localStorage.setItem('userName', JSON.stringify(name));
            window.localStorage.setItem('userBio', JSON.stringify(bio));
            window.localStorage.setItem('userImage', JSON.stringify(profileUploadedUrl));
            window.localStorage.setItem('userBanner', JSON.stringify(bannerUploadedUrl));

            notification({
                type: 'success',
                title: 'Profile Updated Successfully',
                position: 'topR'
            });

            
            await new Promise(resolve => setTimeout(resolve, 2000));
            setLoading(false);
            navigate(`/profile/`);
        } catch (error) {
            notification({
                type: 'error',
                title: 'Transaction Error',
                message: error.message,
                position: 'topR'
            });
            setLoading(false);

        }

    }

    return (
        <>
            <div className="settingsPage">
                <Input label="Name" name="NameChange" width="100%" labelBgColor="#141d26" onChange={(e) => setName(e.target.value)} value={userName}  />
                <Input label="Bio" name="BioChange" width="100%" labelBgColor="#141d26" onChange={(e) => setBio(e.target.value)} value={userBio} />
                <div className="pfp">Change Profile Image</div>
                <Upload onChange={profileHandler} />
                <div className="pfp">Change Banner Image</div>
                <Upload onChange={bannerHandler} />
                {loading ? <div className="save"><Loading /></div> : <div className="save" onClick={updateProfile}>Save</div>}

            </div>
        </>
    )
}

export default Settings;