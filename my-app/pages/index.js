import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { providers, Contract, ethers } from "ethers";
import web3Modal from "web3modal";
import { abi, address } from "../contract";
import { nft_abi, nft_address } from "../nftContract";

export default function Home() {
    const zero = ethers.BigNumber.from(0);
    const [walletConnected, setWalletConnected] = useState(false);
    const [claimedTokens, setclaimedTokens] = useState(true);
    const [tokensOwned, setTokensOwned] = useState(zero);
    const [tokensToClaim, setTokensToClaim] = useState("0");
    const [isOwner, setIsOwner] = useState(false);
    const web3modalRef = useRef();
    const inputValueRef = useRef();

    const connectWallet = async () => {
        try {
            await getProvider();
            setWalletConnected(true);
            tokensToBeClaimed();
            getTokensOwned();
            checkOwner();
        } catch (err) {
            console.log(err);
        }
    };

    const getProvider = async (needSigner = false) => {
        const instance = await web3modalRef.current.connect();
        const provider = new providers.Web3Provider(instance);
        const { chainId } = await provider.getNetwork();
        if (chainId !== 3) {
            window.alert("change network to ropsten");
            throw new Error("change to ropsten network");
        }
        if (needSigner) {
            const signer = provider.getSigner();
            return signer;
        }
        return provider;
    };

    const getTokensOwned = async () => {
        try {
            const provider = await getProvider();
            const ico_contract = new Contract(address, abi, provider);
            const signer = await getProvider(true);
            const userAddres = await signer.getAddress();
            const balance = await ico_contract.balanceOf(userAddres);
            setTokensOwned(balance);
        } catch (err) {
            console.log(err);
        }
    };

    const claimTokens = async () => {
        try {
            const signer = await getProvider(true);
            const ico_contract = new Contract(address, abi, signer);
            const tx = await ico_contract.claim();
            await tx.wait();
            window.alert("claimed tokens");
            getTokensOwned();
            setTokensToClaim("Tokens are Claimed");
            setclaimedTokens(true);
        } catch (err) {
            console.log(err);
        }
    };

    const mintTokens = async () => {
        try {
            const signer = await getProvider(true);
            const ico_contract = new Contract(address, abi, signer);
            if (inputValueRef.current.value > 0) {
                const price = 0.01 * inputValueRef.current.value;
                const tx = await ico_contract.mintToken(
                    inputValueRef.current.value,
                    {
                        value: ethers.utils.parseEther(price.toString()),
                    }
                );
                await tx.wait();
                window.alert("minted tokens :)");
                getTokensOwned();
            } else {
                window.alert("enter valid amount of tokens");
            }
        } catch (err) {
            console.log(err);
        }
    };

    const tokensToBeClaimed = async () => {
        try {
            const provider = await getProvider();
            const ico_contract = new Contract(address, abi, provider);
            const nft_contract = new Contract(nft_address, nft_abi, provider);
            const signer = await getProvider(true);
            const userAddres = await signer.getAddress();
            const balance = await nft_contract.balanceOf(userAddres);
            if (parseInt(balance.toString()) > 0) {
                let tokens = 0;
                for (let i = 0; i < balance; i++) {
                    const tokenId = await nft_contract.tokenOfOwnerByIndex(
                        userAddres,
                        i
                    );
                    const status = await ico_contract.claimed(tokenId);
                    if (!status) {
                        tokens = tokens + 10;
                    }
                }
                setTokensToClaim(tokens.toString());
                setclaimedTokens(false);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const checkOwner = async () => {
        try {
            const provider = await getProvider();
            const ico_contract = new Contract(address, abi, provider);
            const signer = await getProvider(true);
            const userAddres = await signer.getAddress();
            const ownerAddress = await ico_contract.owner();
            if (userAddres.toLowerCase() === ownerAddress.toLowerCase()) {
                setIsOwner(true);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const withdraw = async () => {
        try {
            const signer = await getProvider(true);
            const ico_contract = new Contract(address, abi, signer);
            const tx = await ico_contract.withdraw();
            await tx.wait();
            window.alert("withdrawed");
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (!walletConnected) {
            web3modalRef.current = new web3Modal({
                network: "ropsten",
                providerOptions: {},
                disableInjectedProvider: false,
            });

            connectWallet();
        }
    }, [walletConnected]);

    const render = () => {
        if (!walletConnected) {
            return (
                <button
                    className="block px-4 py-3 mt-6 bg-gradient-to-r from-blue-400 to-pink-600 rounded shadow-lg shadow-pink-600/50 hover:from-pink-400 hover:to-blue-600 hover:shadow-blue-400/50"
                    onClick={connectWallet}
                >
                    Connect
                </button>
            );
        } else {
            return (
                <div>
                    <input
                        type="number"
                        placeholder="Amount of Tokens"
                        className="block shadow appearance-none border rounded w-60 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        ref={inputValueRef}
                    />
                    <button
                        className="block px-5 py-3 mt-6 bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-600 rounded shadow-lg hover:from-sky-400 hover:to-sky-600 shadow-blue-400/50 hover:shadow-cyan-300/80 hover:text-zinc-800"
                        onClick={mintTokens}
                    >
                        mint
                    </button>
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col-reverse  md:flex-row justify-evenly bg-[#94c2c0] min-h-screen pt-16 ">
            <Head>
                <title>Create Next App</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
            </Head>
            <div className="pt-10 mx-auto">
                <h1 className="pb-10 font-serif font-medium text-3xl md:text-4xl">
                    Crypto-Rain Token
                </h1>
                <div className="font-semibold text-lg pb-10">
                    <p>Tokens to be claimed : {tokensToClaim}</p>
                    <p>
                        Tokens owned : {ethers.utils.formatEther(tokensOwned)}
                        {!claimedTokens && (
                            <button
                                className="block px-5 py-3 mt-6 bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-600 rounded shadow-lg hover:from-sky-400 hover:to-sky-600 shadow-blue-400/50 hover:shadow-cyan-300/80 hover:text-zinc-800"
                                onClick={claimTokens}
                            >
                                claim
                            </button>
                        )}
                    </p>
                </div>
                <div className="font-sans font-semibold text-gray-900">
                    {render()}
                    {isOwner && (
                        <button
                            className="block px-5 py-3 mt-6 bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-600 rounded shadow-lg hover:from-sky-400 hover:to-sky-600 shadow-blue-400/50 hover:shadow-cyan-300/80 hover:text-zinc-800"
                            onClick={withdraw}
                        >
                            withdraw
                        </button>
                    )}
                </div>
            </div>

            <div>
                <Image src="/home.jpg" width={820} height={472} />
            </div>
        </div>
    );
}
