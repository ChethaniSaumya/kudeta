import React, { useState, useRef, useEffect } from "react";
import { Avatar, useNotification, Input } from "@web3uikit/core";
import { ethers } from 'ethers';
import "./Messages.css";
import "../components/TweetInFeed.css";
import Web3Modal from "web3modal";
import { TwitterContractAddress, TwitterContractAddress3 } from '../config';
import TwitterAbi from '../abi/Twitter.json';
import TwitterAbi3 from '../abi/Twitter3.json';
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js';
import { Link, useNavigate } from "react-router-dom";
import { Image, Send, Search } from '@web3uikit/icons';
import { useParams } from 'react-router-dom';

const SelectedUserMsgs = () => {
    const Web3StorageApi = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGFBNzVBNzJENEM3ODFhNzhBMEMyODZjZWViZUMwODBhODI0NDNCNjciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTcxMzcyOTI5MDYsIm5hbWUiOiJUd2l0dGVyQVBJIn0.Bt_AyVqdv50PIZ-liMRjBsELi_E78iHBhn9N72JadvI";
    const inputFile = useRef(null);
    const [selectedImage, setSelectedImage] = useState();
    const [tweetText, setTweetText] = useState('');
    const [selectedFile, setSelectedFile] = useState();
    const [uploading, setUploading] = useState(false);
    let ipfsUploadedUrl = '';
    const [_signerAddress, setSignerAddress] = useState('');
    const [_currentClickedUser, setCurrentClickedUser] = useState('');
    const notification = useNotification();
    const navigate = useNavigate();
    const [msgs, setMsgs] = useState([]);
    const [clickedMsgs, setClickedMsgs] = useState([]);
    const msgContainerRef = useRef(null);
    const [searchState, setSearchState] = useState('');
    const [_userImage, setUserImage] = useState('');
    const [_userName, setUserName] = useState('');
    const [_isUserBlocked, setIsUserBlocked] = useState('');
    const { _userWalletAddress } = useParams();

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

    async function listUserConversations() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract3 = new ethers.Contract(TwitterContractAddress3, TwitterAbi3.abi, signer);
        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);
        const signerAddress = await signer.getAddress();
        setSignerAddress(signerAddress);

        const transaction = await contract3.listUserConversations(signerAddress);
        const result = await Promise.all(transaction.map(async msg => {
            const getConversationMessages = await contract3.getConversationMessages(Number(msg.originalConversationId));
            let msgOrder = [];
            let ipfsURL = [];
            for (let x = 0; x < getConversationMessages.length; x++) {
                msgOrder.push(getConversationMessages[x].content);
                ipfsURL.push(getConversationMessages[x][2]);
                console.log("getConversationMessages[x] : " + getConversationMessages[x][2]);
            }

            let otherUser;
            if (msg.user1 == signerAddress) {
                otherUser = msg.user2;
            } else {
                otherUser = msg.user1;
            }

            let getUserDetail = await contract.getUser(otherUser);

            let item = {
                //  sender: msg.user1,
                //  receiver: msg.user2,
                otherUser: otherUser,
                conId: Number(msg.originalConversationId),
                msgContent: msgOrder,
                ipfs: ipfsURL,
                userName: getUserDetail['name'],
                userImage: getUserDetail['profileImg']
            };
            item.key = msg.originalConversationId;
            console.log("msgContent : " + item.ipfs);
            return item;
        }));
        setMsgs(result);
    }

    async function msgClick(conversationId, sender) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract3 = new ethers.Contract(TwitterContractAddress3, TwitterAbi3.abi, signer);
        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);
        const signerAddress = await signer.getAddress();
        setSignerAddress(signerAddress);
        // const currentClickedUser = sender;
        setCurrentClickedUser(sender);

        let getUserDetail = await contract.getUser(sender);
        setUserName(getUserDetail['name']);
        setUserImage(getUserDetail['profileImg']);

        const getConversationMessages = await contract3.getConversationMessages(Number(conversationId));
        const isUserBlocked = await contract.isUserBlocked(signerAddress, sender);
        setIsUserBlocked(isUserBlocked);

        const result = await Promise.all(getConversationMessages.map(async clicked => {


            console.log("Clickeed Time :" + clicked.timeSent);
            // Convert the timestamp to a Date object
            const date = new Date(Number(clicked.timeSent) * 1000);

            console.log("date :" + date);

            // Get the date and time components
            const dateString = date.toLocaleDateString(); // Get the date (e.g., "MM/DD/YYYY")
            const timeString = date.toLocaleTimeString(); // Get the time (e.g., "HH:MM:SS AM/PM")

            //  console.log("dateString :" + dateString);
            //  console.log("timeString :" + timeString);


            // Combine date and time into a single variable
            let dateTimeString = dateString + " " + timeString;
            // console.log("dateTimeString :" + dateTimeString);

            let getUserDetail = await contract.getUser(clicked.sender);

            let item = {
                sender: clicked.sender,
                msgContent: clicked.content,
                ipfsURL: clicked.ipfsURL,
                time: dateTimeString,
                userName: getUserDetail['name'],
                userImage: getUserDetail['profileImg'],
                isUserBlocked: clicked.isUserBlocked
            };

            console.log("Img URL : " + item.ipfsURL);

            return item;

        }));

        setClickedMsgs(result);
        if (msgContainerRef.current) {
            msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight;
        }
    }

    async function search() {
        //navigate(`/profile/${searchState}`);
        setCurrentClickedUser(searchState);
    }

    useEffect(() => {
        try{
        if(_userWalletAddress != null){
            setCurrentClickedUser(_userWalletAddress);
        }else{
        listUserConversations();
        }
        }catch(err){
            console.log(err);
        }
    
    }, []);

    async function sendMsgs() {
        if (tweetText.trim().length < 1) {
            notification({
                type: 'warning',
                message: 'Minimum 5 characters',
                title: 'Message Field Required',
                position: 'topR'
            });
            return;
        }
        const sentences = tweetText.split('\n');
        const combinedSentences = sentences.join('|@|');

        setUploading(true);
        if (selectedImage) {
            await storeFile();
        }

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract3 = new ethers.Contract(TwitterContractAddress3, TwitterAbi3.abi, signer);
        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);

        try {
            console.log("sendMsgsIpfs : " + ipfsUploadedUrl);
            //  const transaction = await contract.addTweet(combinedSentences, ipfsUploadedUrl);      



            const transaction = await contract3.sendMessage(_currentClickedUser, combinedSentences, ipfsUploadedUrl);
            await transaction.wait();

            // Update the conversation list
            const updatedMsgs = msgs.filter(msg => msg.receiver !== _currentClickedUser);
            updatedMsgs.unshift({
                sender: _currentClickedUser, // Assuming _currentClickedUser is the recipient of the message
                // Other properties you want to set for the conversation
            });
            setMsgs(updatedMsgs);

            notification({
                type: 'success',
                title: 'Message Sent Successfully',
                position: 'topR'
            });

            setSelectedImage(null);
            setTweetText('');
            setSelectedFile(null);
            setUploading(false);

            navigate('/messages');
            window.location.reload();

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

    async function handleUserClick(_userWalletAddress) {

        if (_userWalletAddress != _signerAddress) {
            navigate(`/profile/${_userWalletAddress}` /* ), {
 
           state: {
                 userName : userName,
                 userBio : userBio,
                 userImage : userImage,
                 userBanner : userBanner
             },
         }*/);
        } else {
            navigate(`/profile/` /* ), {
 
                state: {
                      userName : userName,
                      userBio : userBio,
                      userImage : userImage,
                      userBanner : userBanner
                  },
              }*/);
        }
    }

    return (
        <>
            <div className="mainContent">

                <div>

                    <div class="formMain2">

                        <div class="formMain-2">
                            <Link to="/" className='link'>
                                <div class="close-button">X</div>
                            </Link>

                            <div className="who2">
                                <Input class="custom-input-label2" label="Search" name="Search" prefixIcon={<Search onClick={search} />} labelBgColor="#141d26" placeholder="0xdc...d39" onChange={(e) => setSearchState(e.target.value)} value={searchState} ></Input>
                                <div></div>
                                {msgs.map((msg, i) => {
                                    return (<>

                                        {msg.otherUser == _currentClickedUser ?

                                            (<div className="who3_" onClick={() => msgClick(Number(msg.conId), msg.otherUser, msg.ipfsURL, msg.time)}>
                                                <div><Avatar isRounded theme="image" onClick={(e) => { e.stopPropagation(); handleUserClick(msg.otherUser) }} image={msg.userImage} className="avatar" /></div>
                                                <div className="completeTweet2">

                                                    <div className="senders">

                                                        <div>
                                                            <div className="nameDate">
                                                                <div className="user--1">{msg.otherUser.slice(0, 3) + "..." + msg.otherUser.slice(39, 49)}</div>
                                                            </div>
                                                            <div></div>
                                                            <div className="accWhen">{msg.userName}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>) :
                                            (<div className="who3" onClick={() => msgClick(Number(msg.conId), msg.otherUser, msg.ipfsURL, msg.time)}>
                                                <div><Avatar onClick={(e) => { e.stopPropagation(); handleUserClick(msg.otherUser) }} isRounded theme="image" image={msg.userImage} className="avatar" /></div>
                                                <div className="completeTweet2">

                                                    <div className="senders">

                                                        <div>
                                                            <div className="nameDate">
                                                                <div className="user--1">{msg.otherUser.slice(0, 3) + "..." + msg.otherUser.slice(39, 49)}</div>
                                                            </div>
                                                            <div></div>
                                                            <div className="accWhen">{msg.userName}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>)}
                                    </>);
                                })}


                            </div>

                            <div className="msgs" ref={msgContainerRef}>

                                {clickedMsgs.map((clicked, i) => {
                                    return (
                                        <div class="senderAndRec">
                                            {_signerAddress == clicked.sender ?
                                                (
                                                    <div className="msgCon" >
                                                        <div>
                                                            <div className="accWhen">{clicked.sender.slice(0, 3) + "..." + clicked.sender.slice(39, 49)}</div>
                                                            <div className="cont">{clicked.msgContent}</div>
                                                        </div>
                                                        <div>
                                                            {clicked.ipfsURL !== '' ? (
                                                                <img src={clicked.ipfsURL} className="tweetImg" />
                                                            ) : null}
                                                        </div>
                                                        <div className="day">{clicked.time}</div>
                                                    </div>
                                                ) :
                                                (
                                                    <div className="msgCon2" >
                                                        <div>
                                                            <div className="accWhen">{clicked.sender.slice(0, 3) + "..." + clicked.sender.slice(39, 49)}</div>
                                                            <div className="cont">{clicked.msgContent}</div>
                                                        </div>
                                                        <div className="day">{clicked.time}</div>
                                                    </div>
                                                )
                                            }


                                        </div>

                                    );

                                })}


                                <div className="who4">
                                    <div><Avatar isRounded theme="image" image={_userImage} className="avatar" /></div>

                                    <div className="completeTweet2">

                                        <div className="senders">
                                            <div className="nameDate">
                                                <div>
                                                    <div className="user--1">{_currentClickedUser}</div>
                                                    <div className="accWhen">{_userName}</div>
                                                </div>
                                            </div>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>

                                {_isUserBlocked ?
                                    (<div className="sendMsg2">

                                        <input className="typeMsg"
                                            type="text"
                                            placeholder="You can't send messages to this user"
                                            value={tweetText}
                                            onChange={(e) => setTweetText(e.target.value)}
                                            disabled
                                        />

                                        <div className="imgDiv2" >
                                            <div onClick={onImageClick}><input type="file" ref={inputFile} onChange={changeHandler} style={{ display: "none" }} />
                                                {selectedImage ? <img src={selectedImage} width={150} /> : <Image fontSize={25} fill="gray" />}
                                            </div>
                                            <div><Send className="send" onClick={sendMsgs} fontSize={25} fill="gray">Send</Send></div>

                                        </div>

                                    </div>) :
                                    (<div className="sendMsg">

                                        <input className="typeMsg"
                                            type="text"
                                            placeholder="Type your message"
                                            value={tweetText}
                                            onChange={(e) => setTweetText(e.target.value)}
                                            
                                        />

                                        <div className="imgDiv2" >
                                            <div onClick={onImageClick}><input type="file" ref={inputFile} onChange={changeHandler} style={{ display: "none" }} />
                                                {selectedImage ? <img src={selectedImage} width={150} /> : <Image fontSize={25} fill="rgb(185, 16, 59)" />}
                                            </div>
                                            <div><Send className="send" onClick={sendMsgs} fontSize={25} fill="rgb(185, 16, 59)">Send</Send></div>

                                        </div>

                                    </div>)
}

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}

export default SelectedUserMsgs;
