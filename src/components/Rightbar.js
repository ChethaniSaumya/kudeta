import React, { useState, useEffect } from "react";
import './Rightbar.css';
//import img1 from '../images/img1.png';
//import img2 from '../images/img2.png';
//import img3 from '../images/img3.png';
//import img4 from '../images/img4.png';
import { Input } from '@web3uikit/core';
import { Search } from "@web3uikit/icons";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import { TwitterContractAddress, Web3StorageApi } from '../config';
import TwitterAbi from '../abi/Twitter.json';
import { Link, useNavigate } from 'react-router-dom';

const Rightbar = (props) => {

    let reloadComponent = props.reload;
    const [loadingState, setLoadingState] = useState('not-loaded');
    const [tweets, setTweets] = useState([]);
    const [trends, setTrends] = useState([]);
    const navigate = useNavigate();
    const [searchState, setSearchState] = useState('');

    /* const trends = [
         {
             img: img0,
             text: "Empowering Progress through Blockchain Innovation",
             link: "#"
         },
         {
             img: img1,
             text: "Forging the Future, One Block at a Time",
             link: "#"
         },
         {
             img: img2,
             text: "Secure, Transparent, and Boundless: The Blockchain Frontier",
             link: "#"
         },
         {
             img: img3,
             text: "Blockchain: Building Trust in a Digital World",
             link: "#"
         },
         {
             img: img4,
             text: "Blockchain: Building Trust in a Digital World",
             link: "#"
         },
         {
             img: img5,
             text: "Blockchain: Building Trust in a Digital World",
             link: "#"
         },
         {
             img: img6,
             text: "Blockchain: Building Trust in a Digital World",
             link: "#"
         },
     ];*/

    async function search() {
        navigate(`/profile/${searchState}`);
    }

    async function getTopLikedTweetsLast7Days() {

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        let provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);
        const data = await contract.getTopLikedTweetsLast7Days(7);

        const result = await Promise.all(data.map(async tweet => {
            const unixTime = tweet.timestamp;
            const date = new Date(unixTime * 1000);
            const tweetDate = date.toLocaleDateString("fr-CH");
            // Fetch the user's profile information

            const sentences = tweet.tweetText.split('\n'); // Split by line breaks

            // Join the sentences with a delimiter
            const combinedSentences = sentences.join('|@|');

            let getUserDetail = await contract.getUser(tweet.tweeter);

            let originality = await contract.checkOriginalStatus(tweet.id);
            let originalTweetID;

            if (originality) {
                originalTweetID = tweet.id;
            } else {
                originalTweetID = tweet.originalTweetID;
            }

            console.log("originalTweetID : " + originalTweetID);

            let item = {
                tweeter: tweet.tweeter,
                id: tweet.id,
                tweetText: combinedSentences,
                tweetImg: tweet.tweetImg,
                isDeleted: tweet.isDeleted,
                userName: getUserDetail['name'],
                userImage: getUserDetail['profileImg'],
                date: tweetDate,
                likes: Number(tweet.likes),
                originalID: originalTweetID
            };

            console.log("originalID : " + item.originalID);
            // Add a unique "key" using the tweet ID
            item.key = tweet.id;

            return item;

        }));

        // Create a list of trends with user images and truncated tweet text
        const trendList = result.slice(0, 7).map((item, index) => {
            return {
                img: item.userImage, // Use the user's profile image as img0, img1, ...
                text: item.tweetText.split(' ').slice(0, 7).join(' '), // Limit text to 7 words
                // originalTweetID: item.originalID
                link: `http://localhost:3000/post/${item.originalID}` // You can specify a link if needed
            };
        });

        setTrends(trendList);


        console.log("trends1 :" + trends.img);
        console.log("trends2 :" + trends.text);
        console.log("trends3 :" + trends.originalTweetID);

        // setTweets(result.reverse());
        setLoadingState('loaded');
    }

    useEffect(() => {

        getTopLikedTweetsLast7Days();

    }, [reloadComponent]);


    async function post(tweetID) {

        console.log("tweetID_RB : " + tweetID);
        navigate(`/post/${tweetID}`/*, {
 
            state: {
                  tweetid : tweetID
            
              },
          }*/);

    }

    return (
        <>
            <div className="rightbarContent">
                <Input class="custom-input-label" label="Search" name="Search" prefixIcon={<Search onClick={search} />} labelBgColor="#141d26" placeholder="0xdc...d39" onChange={(e) => setSearchState(e.target.value)} value={searchState} ></Input>
                <div className="trends">
                    Trending
                    {
                        trends.map((e) => {
                            return (
                                <>
                                    <div className="trend" onClick={() => window.open(e.link)}>
                                        <img src={e.img} className="trending" />

                                        {(e.text.split('|@|')).map((sentence, index) => (
                                            <div className="trendText" key={index}>{sentence}</div>
                                        ))}

                                    </div>
                                </>
                            );
                        })
                    }
                </div>
            </div>
        </>
    );
}

export default Rightbar;