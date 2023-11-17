// PrivacyPolicy.js
import React, { useEffect } from "react";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import './PP.css';

const Disclaimer = () => {

    async function myDetails() {

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        console.log("PP :" + signerAddress);

    }

    useEffect(() => {
        myDetails();
    }, []);

    return (
        <div>
            {/* Render the content of the Privacy Policy PDF here */}
            <div id="policy" width="640" height="480"
                data-policy-key="WVRGdmRVaEdTakpaU21RNFZYYzlQUT09"
                data-extra="h-align=left&table-style=accordion" > Please wait while the policy is loaded. If it
                does not load, please <a rel="nofollow"
                    href="https://app.termageddon.com/api/policy/WVRGdmRVaEdTakpaU21RNFZYYzlQUT09?h-a
lign=left&table-style=accordion" target="_blank">click here</a>. </div><script
                src="https://app.termageddon.com/js/termageddon.js"></script>
        </div>
    );
};

export default Disclaimer;
