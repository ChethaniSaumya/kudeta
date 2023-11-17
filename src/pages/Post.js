import React, { useState, useEffect, useRef } from "react";
import '../components/TweetInFeed.css';
import { defaultImgs } from "../defaultImgs";
import { Avatar, Loading, useNotification } from "@web3uikit/core";
import { MessageCircle, Star, Matic, Bin, Calendar, heart, Heart, HeartFilled, More, AddUser, Ban, Event, HandCoin } from "@web3uikit/icons";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import { TwitterContractAddress, Web3StorageApi } from '../config';
import TwitterAbi from '../abi/Twitter.json';
import { Link, useParams, useNavigate } from 'react-router-dom';
import TweetReplies from '../components/TweetReplies';
import { Image } from '@web3uikit/icons';
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js';

const Post = () => {
    const Web3StorageApi = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGFBNzVBNzJENEM3ODFhNzhBMEMyODZjZWViZUMwODBhODI0NDNCNjciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTcxMzcyOTI5MDYsIm5hbWUiOiJUd2l0dGVyQVBJIn0.Bt_AyVqdv50PIZ-liMRjBsELi_E78iHBhn9N72JadvI";

    const [tweet, setTweet] = useState(null);
    const [replies, setReplies] = useState([]);

    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = (e) => {
        e.stopPropagation(); // Prevent other click events from propagating
        setDropdownOpen(!isDropdownOpen);
    };
    const { _tweetid } = useParams();
    console.log("tweetid :" + _tweetid);

    const [tweets, setTweets] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');
    const [contractTwitter, setcontract] = useState('');
    const [_signerAddress, setSignerAddress] = useState('');
    const [userName, setUserName] = useState('');
    const [userBio, setBio] = useState('');
    const [userImage, setUserImg] = useState('');
    const [userBanner, setUserBanner] = useState('');
    const [tweeter, setTweeter] = useState('');
    const [id, setid] = useState('');
    const [tweetImg, setTweetImg] = useState('');
    const [isDeleted, setIsDeleted] = useState('');
    const [tweetText, setTweetText] = useState('');
    const [date, setTweetDate] = useState('');
    const [comingFromPost, setComingFromPost] = useState(true);
    const [tweetLikes, setTweetLikes] = useState(0);

    const navigate = useNavigate();
    const notification = useNotification();

    const [selectedImage, setSelectedImage] = useState();
    const inputFile = useRef(null);
    const [replyTxt, setReplyTxt] = useState('');
    const [uploading, setUploading] = useState(false);
    let ipfsUploadedUrl = '';
    const [selectedFile, setSelectedFile] = useState();
    const [loading, setNewLoadingState] = useState(false);
    const [receivingWallet, setReceivingWallet] = useState('');
    const [getOriginalReplyCount, setGetOriginalReplyCount] = useState('');
    const [hasLikedTweet, setHasLikedTweet] = useState(false);

    const onImageClick = () => {
        inputFile.current.click();
    }

    async function storeFile() {
        const client = new Web3Storage({ token: Web3StorageApi });
        const rootCid = await client.put(selectedFile);
        ipfsUploadedUrl = `https://${rootCid}.ipfs.dweb.link/${selectedFile[0].name}`;
    }

    const sendMaticWithTip = async (recipient) => {
        setNewLoadingState(true);

        // set_popUp(1);
        setReceivingWallet(recipient);
        sendMaticForm();
    }

    const sendMaticForm = async () => {
        try {
            // Get the Web3 provider
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);

            // Get the signer
            const signer = provider.getSigner();

            // Create a contract instance
            const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);

            // Convert the recipient address to a string
            const recipientString = receivingWallet.toString();

            // Parse the ether amount
            const etherAmount = ethers.utils.parseEther('1');

            // Send the tip
            const tx = await contract.sendMaticWithTip('0', recipientString, { value: '20000000000000000' });
            await tx.wait();
            setNewLoadingState(false);

            // Show a success notification
            /*   notification({
                   type: 'success',
                   title: 'Tiped Successfully',
                   position: 'topR',
               });
   */
            window.location.reload();

        } catch (error) {
            // Show an error notification
            /*      notification({
                      type: 'error',
                      title: 'Transaction Error',
                      message: [error],
                      position: 'topR',
                  });*/
        }
    }


    const changeHandler = (event) => {
        const imgFile = event.target.files[0];
        setSelectedImage(URL.createObjectURL(imgFile));
        setSelectedFile(event.target.files);
    }

    /* const filterBlockedTweets = (tweets) => {
         return tweets.filter(tweet => !blockedUsers.includes(tweet.tweeter));
     };*/

    async function addReply() {

        console.log("replyTxt : " + replyTxt);
        if (replyTxt.trim().length < 5) {
            notification({
                type: 'warning',
                message: 'Minimum 5 characters',
                title: 'Reply Required',
                position: 'topR'
            });
            return;
        }

        const sentences = replyTxt.split('\n'); // Split by line breaks

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
            // const data = await contract.getReplies(passingTweetId);

            /*const result = await Promise.all(data.map(async tweet => {

                const unixTime = reply.timestamp;
                const date = new Date(unixTime * 1000);
                const replyDate = date.toLocaleDateString("fr-CH");
    
                let getUserDetail = await contract.getUser(reply.tweeter);
                const following = await contract.isUserFollowing(signer.getAddress(), reply.tweeter);
    
                let originality = await contract.checkOriginalStatus(passingTweetId);
                console.log("reply.originality : " + originality);
    
                let getOriginalRetweetCountLikes = await contract.getOriginalRetweetCountLikes(passingTweetId);
                console.log("getOriginalRetweetCount : " + getOriginalRetweetCountLikes[0]);
                console.log("getOriginalLikes : " + getOriginalRetweetCountLikes[1]);
    
                let item = {
                    tweeter: reply.tweeter,
                    id: reply.id,
                    tweetText: reply.tweetText,
                    tweetImg: reply.tweetImg,
                    isDeleted: reply.isDeleted,
                    userName: getUserDetail['name'],
                    userImage: getUserDetail['profileImg'],
                    date: replyDate,
                    likes: Number(getOriginalRetweetCountLikes[1]),
                    isUserFollowing: following,
                    isRetweet: !originality,
                    retweeterAddress: reply.retweeter,
                    retweetCount: Number(getOriginalRetweetCountLikes[0])

                };

 
                // Add a unique "key" using the tweet ID
                item.key = reply.id;
    
    
                console.log("retweeter :" + item.retweeterAddress);
                console.log("retweeter :" + item.retweeterAddress);
    
                return item;
            }));*/

            const transaction = await contract.addReply(_tweetid, combinedSentences, ipfsUploadedUrl);
            await transaction.wait();

            notification({
                type: 'success',
                title: 'Reply Added Successfully',
                position: 'topR'
            });


            setSelectedImage(null);
            setReplyTxt('');
            setSelectedFile(null);
            setUploading(false);

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

    async function blockUser(userToBlock) {
        try {
            // Call the Ethereum smart contract's "blockUser" function to block the specified user
            const blockUser = await contractTwitter.blockUser(userToBlock);
            await blockUser.wait();
            notification({
                type: 'success',
                title: 'User Blocked Successfully',
                position: 'topR',
            });
        } catch (error) {
            console.error('Error blocking user:', error);
            notification({
                type: 'error',
                message: 'Failed to block user',
                title: 'Error',
                position: 'topR',
            });
        }


    }

    async function blockTweet(tweetID) {

        try {
            // Call the Ethereum smart contract's "blockTweet" function to block the specified tweet
            const blockResult = await contractTwitter.blockTweet(tweetID);
            await blockResult.wait();
            notification({
                type: 'success',
                title: 'Tweet Blocked Successfully',
                position: 'topR',
            });

            window.location.reload();

        } catch (error) {
            notification({
                type: 'error',
                message: 'Failed to block tweet',
                title: 'Error',
                position: 'topR',
            });
        }

        // You can update your application's state here as needed
        // For example, if you want to maintain a list of blocked tweets:
        // setBlockedTweets([...blockedTweets, tweetID]);
    }


    const handleDropdownOption = (action, user) => {
        // Handle the selected dropdown option here
        if (action === "Not interested") {
            // Handle "Not interested" action
        } else if (action === "Mute" && user) {
            // Handle "Mute" action with the specified user
        }
        // Close the dropdown
        setDropdownOpen(false);
    };


    useEffect(() => {
        const fetchTweet = async () => {
            try {

                const web3Modal = new Web3Modal();
                const connection = await web3Modal.connect();
                let provider = new ethers.providers.Web3Provider(connection);
                const signer = provider.getSigner();
                const signerAddress = await signer.getAddress();
                setSignerAddress(signerAddress);
                const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer)
                setcontract(contract);

                // Call the smart contract method to get the tweet by ID
                const tweetData = await contract.getTweetById(_tweetid);

                console.log("tweetData : " + tweetData.tweeter);
                console.log("tweetData : " + tweetData.id);
                console.log("tweetData : " + tweetData.tweetImg);
                console.log("tweetData : " + tweetData.isDeleted);
                console.log("tweetData : " + tweetData.tweetText);


                let getUserDetail = await contract.getUser(tweetData.tweeter);

                setUserName(getUserDetail['name']);
                setUserImg(getUserDetail['profileImg']);

                setTweeter(tweetData.tweeter);
                setid(tweetData.id);
                setTweetImg(tweetData.tweetImg);
                setIsDeleted(tweetData.isDeleted);
                setTweetText(tweetData.tweetText);

                const unixTime = tweetData.timestamp;
                const date = new Date(unixTime * 1000);
                const tweetDate = date.toLocaleDateString("fr-CH");
                setTweetDate(tweetDate);
                setTweetLikes(Number(tweetData.likes));

                console.log("tweetDate : " + tweetDate);
                console.log("likes : " + tweetData.likes);
                console.log("userName : " + userName);
                console.log("profileImg : " + userImage);

                let getOriginalReplyCount = await contract.getReplyCount(_tweetid);
                console.log("getOriginalReplyCount : " + getOriginalReplyCount);
                setGetOriginalReplyCount(Number(getOriginalReplyCount));

                let hasLikedTweet = await contract.hasLikedTweet(signerAddress, _tweetid);
                setHasLikedTweet(hasLikedTweet);
                console.log("hasLikedTweet post: " + hasLikedTweet);
                /*   const result = await Promise.all(tweetData.map(async tweet => {
                       const unixTime = tweet.timestamp;
                       const date = new Date(unixTime * 1000);
                       const tweetDate = date.toLocaleDateString("fr-CH");
                      // let getUserDetail = await contract.getUser(tweet.tweeter);
   
                       let item = {
                           tweeter: tweet.tweeter,
                           id: tweet.id,
                           tweetText: tweet.tweetText,
                           tweetImg: tweet.tweetImg,
                           isDeleted: tweet.isDeleted,
                          // userName: getUserDetail['name'],
                          // userImage: getUserDetail['profileImg'],
                           date: tweetDate,
                           likes: Number(tweet.likes)
   
                       };
   
                       // Add a unique "key" using the tweet ID
                       item.key = tweet.id;
   
                       return item;
                   }));
   */
                //setTweets(result.reverse());

                // const filteredTweets = filterBlockedTweets(result);

                // Update the state with the fetched tweet data
                setTweet(tweetData);
                setLoadingState('loaded');

            } catch (error) {
                console.error("Error fetching tweet:", error);
            }
        };

        const fetchReplies = async () => {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            let provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();
            setSignerAddress(signerAddress);
            const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer)
            setcontract(contract);
            try {

                // Assuming your contract has a method called `getReplies` to fetch replies
                const replyData = await contract.getReplies(_tweetid);

                console.log("TweetID :" + _tweetid);
                console.log("replyData :" + replyData);



                const result = await Promise.all(replyData.map(async replyTweet => {
                    /*   const unixTime = tweet.timestamp;
                       const date = new Date(unixTime * 1000);
                       const tweetDate = date.toLocaleDateString("fr-CH");
   */
                    let getUserDetail = await contract.getUser(replyTweet[0]);

                    /*  let originality = await contract.checkOriginalStatus(tweet.id);
                      let originalTweetID;
  
                      if (originality) {
                          originalTweetID = tweet.id;
                      } else {
                          originalTweetID = tweet.originalTweetID;
                      }*/

                    let item = {
                        tweeter: replyTweet[0],
                        // id: replyTweet.id,
                        tweetText: replyTweet[1],
                        tweetImg: replyTweet[2],
                        userName: getUserDetail['name'],
                        userImage: getUserDetail['profileImg'],
                        date: replyTweet[3],
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

        fetchReplies();
        fetchTweet();
    }, [_tweetid]);

    async function deleteTweet(tweetId) {
        setLoadingState('not-loaded')

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer)
        const data = await contract.deleteTweet(tweetId, true);
        await data.wait();
        notification({
            type: 'success',
            title: 'Tweet Deleted Successfully',
            position: 'topR',
            icon: <Bin />
        });

        navigate(`/profile/`);

        //loadMyTweets();

    }

    async function likeTweet(tweetId) {

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer)
        try {
            const data = await contract.likeTweet(tweetId);
            await data.wait();
            notification({
                type: 'success',
                title: 'Tweet liked Successfully',
                position: 'topR'
            });
        } catch (error) {
            console.log('ERROR', error);
            const reason = error.reason || "Unknown Reason";

            notification({
                type: 'warning',
                message: `Error: ${reason}`,
                title: 'Error',
                position: 'topR'
            });
            return;
        }

        // loadMyTweets();
        window.location.reload();
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

    if (loadingState == 'not-loaded') return (
        <div className="loading">
            <Loading size={60} spinnerColor="#8247" />
        </div>
    )

    if (loadingState == 'loaded' && !tweet) return (
        <h1 className="loading">No Tweet Available</h1>
    )

    return (
        <>
            <div className="FeedTweet">
                <Avatar onClick={() => { handleUserClick(tweeter) }} isRounded image={userImage} theme="image" className="avatar" />
                <div className="completeTweet">
                    <div className="who">
                        <div>
                            {userName}
                            <div className="accWhen" onClick={() => { handleUserClick(tweeter) }}>{tweeter}</div>
                        </div>
                        {tweeter !== _signerAddress && ( // Check if the current user is not the tweeter
                            <div className="dropdown" onClick={(e) => toggleDropdown(e)}>
                                <More theme="image" size={60} />
                                {isDropdownOpen && (
                                    <div className="dropdown-content">
                                        <div onClick={() => blockTweet(id)}>Not interested in this post</div>
                                        <div onClick={() => handleDropdownOption("Not interested")}><AddUser size={30} /> Follow {userName}</div>
                                        <div onClick={() => blockUser(tweeter)}><Ban size={30} /> Block {userName}</div>
                                        <div onClick={() => handleDropdownOption("Mute", tweeter)}>Embed post {userName}</div>
                                        <div onClick={() => handleDropdownOption("Mute", tweeter)}><Event size={30} /> Report post {userName}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="tweetContent">
                        {(tweet.tweetText.split('|@|')).map((sentence, index) => (
                            <div key={index}>{sentence}</div>
                        ))}
                        {tweetImg ? (
                            <img src={tweetImg} className="tweetImg" />) : null
                        }
                    </div>
                    <div className="interactions">
                        <div className="interactionNums" ><MessageCircle color="#b8b8b8" fontSize={20} />{getOriginalReplyCount}</div>
                        {hasLikedTweet ?
                            (<div className="interactionNums" onClick={(e) => { e.stopPropagation(); likeTweet(id) }}><HeartFilled color="#911d3a" fontSize={20} />{tweetLikes}</div>) :
                            (<div className="interactionNums" onClick={(e) => { e.stopPropagation(); likeTweet(id) }}><Heart color="#b8b8b8" fontSize={20} />{tweetLikes}</div>)}
                        <div className="interactionNums" ><Calendar color="#b8b8b8" fontSize={20} />{date}</div>
                        {tweeter === _signerAddress ? <div className="interactionNums"><Bin fontSize={20} color="#FF0000" onClick={() => deleteTweet(id)} /></div> :
                            <div className="interactionNums" onClick={(e) => { e.stopPropagation(); sendMaticWithTip(tweet.tweeter) }}>
                                <span class="initialText"><HandCoin className="icon" color="#911d3a" fontSize={20} />Tip</span>
                                <span class="hoverText"><Matic className="icon" fontSize={20} />0.02</span>
                            </div>}
                    </div>
                </div>


            </div>

            <div>

            </div>

            <div className="profileTweet">
                <div className="tweetSection">
                    <div><Avatar isRounded theme="image" size={60} /></div>
                    <textarea value={replyTxt} name="TweetTxtArea" placeholder="Post Your Reply" className="textArea" onChange={(e) => setReplyTxt(e.target.value)}></textarea>
                </div>

                <div className="tweetSection">
                    <div className="imgDiv" onClick={onImageClick}>
                        <input type="file" ref={inputFile} onChange={changeHandler} style={{ display: "none" }} />

                    </div>

                    <div className="tweet" onClick={addReply}>{uploading ? <Loading /> : 'Reply'}</div>

                </div>
            </div>

            <TweetReplies replies={replies} passingTweetId={_tweetid} comingFromPost={comingFromPost} />





        </>
    );
}

export default Post;