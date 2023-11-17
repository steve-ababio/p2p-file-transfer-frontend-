"use client"
import {MdOutlineClose} from "react-icons/md";
import {PiPlugsConnected} from "react-icons/pi";
import {useEffect,useRef,useState } from "react";
import {Slide,ToastContainer,toast } from "react-toastify";
import {PiPlugsLight} from "react-icons/pi";
import {FcInfo} from "react-icons/fc";
import {CgCheckO} from "react-icons/cg";
import {Socket,io} from "socket.io-client";
import {SIGNAL_URI} from "./config/config";
import ErrorDisplay from "./components/error/error";
import ProgressBar from "./components/progressbar/progressbar";
import FileMetaData from "./components/filemetadata/filemetadata";
import FileSelectInput from "./components/fileselectinput/fileselectinput";
import Header from "./components/header/header";
import ShortUniqueId from "short-unique-id";
import RemotePeerIDPane from "./components/remotepeeridpane/remotepeeridinput";
import GeneratedConnectionID from "./components/generatedconnectionid/generatedconnectionid";
import ConnectionStatus from "./components/connectionstatus/connectionstatus";
import SecondaryButton from "./components/button/secondarybutton";
import Section from "./components/section/section";
import 'react-toastify/dist/ReactToastify.css';

type BootState = "booted"|"booting"|"off";
const BYTE_SIZE = 1024;
const CHUNK_SIZE = BYTE_SIZE * 16;// 16 kilobytes
const RTC_DATA_CHANNEL_LABEL = "FILE-TRANSFER";
const HIGH_wATER_MARK = Math.floor(11 * 1024 * 1024);//11 megabytes

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};
export default function Home() {
  const [connectID,setConnectID] = useState("");
  const [tooltip,showTooltip] = useState(false);
  const [showfiletransferprogress,setShowFileTransferProgress] = useState(false);
  const [bootstate,setBootState] = useState<BootState>("off");
  const [filedata,setFileData] = useState({filename:"",filesize:0,mimetype:"",unit:"",filesizebytes:0});
  const [connectionstate,setConnectionState] = useState<RTCPeerConnectionState>("disconnected");
  const [chunkedsizedelivered,setChunkSizeDelivered] = useState(0);
  const [connectionstateerror,setConnectionStateError] = useState("");
  const [usertype,setUserType] = useState<"sender"|"receiver">("receiver");
  const [remotepeerID,setRemotePeerID] = useState("");
  const remotepeerIDref = useRef("");

  const peerconnection = useRef<RTCPeerConnection>();
  const datachannel = useRef<RTCDataChannel>();
  const connectidelem = useRef<HTMLSpanElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const filereader = useRef<FileReader>();
  const socket = useRef<Socket>();
  const tooltiptimeoutid = useRef(0);
  const receivedfiletotalsize = useRef(0);

  function handleDataChannelStatus(e:Event,datachannel:RTCDataChannel){
    const datachannelstate = datachannel.readyState;
    switch(datachannelstate){
      case "connecting":
        console.log("creating data channel with peer...");
        break;
      case "open":
        console.log("Data channel with peer opened");
        break;
      case "closed":
        console.log("Data channel closed")
    }
  }
  function receiveFile({data}:MessageEvent,filechunks:ArrayBuffer[]){
    if(data instanceof ArrayBuffer){
      setChunkSizeDelivered(prev=>prev + (data.byteLength / receivedfiletotalsize.current) * 100);
      filechunks.push(data);
    }else{
      const receiveddata = JSON.parse(data);
      if(typeof receiveddata === 'number'){
        setShowFileTransferProgress(true);
        receivedfiletotalsize.current = receiveddata;
      }else{
        const {mimetype,filename} = JSON.parse(data);
        const file = new Blob(filechunks,{type:mimetype});
        filechunks.length = 0; //empty the array
        const link = Object.assign(document.createElement("a"),{
          href: URL.createObjectURL(file),
          download: filename,
        });
        link.click();
        URL.revokeObjectURL(link.href); 
        setShowFileTransferProgress(false);
        setChunkSizeDelivered(0);
        toast.info(`file received from ${remotepeerID}`,{
          delay:5000
        });
      }
    }
  }
  useEffect(function(){
    async function onOffer({offer,peerID}:{offer:RTCSessionDescription,peerID:string}){
        setRemotePeerID(peerID);
        remotepeerIDref.current = peerID;
        setUserType("receiver");
        peerconnection.current?.addEventListener("datachannel",function({channel}:RTCDataChannelEvent){
          datachannel.current = channel;
          datachannel.current.addEventListener("open",(e)=>handleDataChannelStatus(e,datachannel.current!));
            let filechunks:ArrayBuffer[] = [];
            datachannel.current.addEventListener("message",(e:MessageEvent)=>receiveFile(e,filechunks));              
        });
        await peerconnection.current?.setRemoteDescription(offer),
        await peerconnection.current?.setLocalDescription();
        socket.current?.emit("answer",{
          answer:peerconnection.current?.localDescription,
          peerID
        });   
    }
    if(socket.current){
      socket.current.on("offer",onOffer);
    }
    return()=>{
      socket.current?.off("offer",onOffer);
    }
  },[connectID]);

  useEffect(function(){
    function onAnswer({answer}:{answer:RTCSessionDescription}){
      console.log("remote answer: ",answer)
      peerconnection.current?.setRemoteDescription(answer);
    }
    if(socket.current){
      socket.current.on("answer",onAnswer);
    }
    return()=>{
      socket.current?.off("answer",onAnswer);
    }
  },[connectID]);

  function handleConnection(){
    if(bootstate === "off"){
      startConnection();
    }else if(bootstate === "booted"){
      closeConnection();
    }
  }
  function startConnection(){
    setBootState("booting");
    const userID = generateConnectID();
    socket.current = io(SIGNAL_URI,{
      reconnectionAttempts:10,
      reconnectionDelay:500,      
    });
    socket.current.on("connect_error",(error)=>{
      console.log(error)
    });
    socket.current.on("icecandidate",function({icecandidate}){
      console.log("remote icecandidate: ",icecandidate);
      peerconnection.current?.addIceCandidate(icecandidate);
    });
    socket.current.auth = {
      userID
    };
    peerconnection.current = new RTCPeerConnection(configuration);
    peerconnection.current?.addEventListener("icecandidate",function({candidate}){
      console.log("local icecandidates: ",candidate);
      if(candidate){
        socket.current?.emit("icecandidate",{icecandidate:candidate,peerID:remotepeerIDref.current});
      }
    });
    peerconnection.current?.addEventListener("iceconnectionstatechange",function(){
      console.log("iceconnectionstatechange: ",peerconnection.current?.iceConnectionState);
      if(peerconnection.current?.iceConnectionState === "failed"){
        peerconnection.current.restartIce();
      }
    });
    peerconnection.current?.addEventListener("connectionstatechange",function(){
      setConnectionState(peerconnection.current!.connectionState);
      if(peerconnection.current?.connectionState === "failed"){
        setConnectionStateError(`Error connecting to peer ${remotepeerIDref.current}`);
      }
    });
    setBootState("booted");
  }
  function closeConnection(){
    if(socket.current){
      socket.current.io.engine.close();
    }
    if(peerconnection.current?.connectionState !== "connecting"){
      peerconnection.current?.close();
    }
    toast.info("Connection terminated");
    setBootState("off");
    setConnectionState("disconnected");
    setRemotePeerID("");
    if(connectionstateerror){
      setConnectionStateError("");
    }
  }
  async function connectToPeer(){
    if(remotepeerID !== ""){
      socket.current?.emit("checkpeerexistence",{peerID:remotepeerID});
      socket.current?.on("peerexists",function({peerexists}:{peerexists:boolean}){
        console.log("peerexists: ",peerexists);
        if(peerexists){
          if(connectionstateerror !== ""){
            setConnectionStateError("");
          }
          if(peerconnection.current !== null || peerconnection.current !== undefined){  
            peerconnection.current?.addEventListener("negotiationneeded",async function(){
              try{
                await peerconnection.current?.setLocalDescription();
                console.log("offer: ",peerconnection.current?.localDescription);
                socket.current?.emit("offer",{offer:peerconnection.current?.localDescription,peerID:remotepeerIDref.current});    
              }catch(err){
                console.log(err);
              }
            });
            datachannel.current = peerconnection.current?.createDataChannel(RTC_DATA_CHANNEL_LABEL);
            let filechunks:ArrayBuffer[] = [];
            datachannel.current?.addEventListener("message",(e:MessageEvent)=>receiveFile(e,filechunks))
          }
        }else{
          setConnectionStateError(`Peer ${remotepeerID} does not exists`);
        }
      });
    }
  }
  function generateConnectID(){
    const {randomUUID} = new ShortUniqueId({length:8});
    const connectID = randomUUID();
    setConnectID(connectID);
    return connectID;
  }
  async function copyPeerID(e:React.MouseEvent){
    try {
      await navigator.clipboard.writeText(connectidelem.current!.textContent!);
        if(connectidelem.current!.textContent! !== ""){
          showTooltip(true);
          clearTimeout(tooltiptimeoutid.current);
          tooltiptimeoutid.current = window.setTimeout(()=>{showTooltip(false)},4000);
      }
    }catch (err) {
      toast.error('Failed to copy selected text');
    }
  }
  async function selectFile(e:React.ChangeEvent<HTMLInputElement>){
    const units = ["B","KB","MB","GB",];
    const files = e.target.files!;
    const selectedfile = files[0];
    if(selectedfile){
      const filename = selectedfile.name;
      const unitindex = Math.floor(Math.log(selectedfile.size) / Math.log(1024));
      const filesize = parseFloat((selectedfile.size / Math.pow(1024,unitindex)).toFixed(1));
      const mimetype = selectedfile.type;
      setFileData({filename,filesize,mimetype,unit:units[unitindex],filesizebytes:selectedfile.size});
    }
  }
  function sendFile(){
    setUserType("sender");
    let selectedfile = file.current!.files![0];
    const {filename,mimetype} = filedata;
    datachannel.current!.send(JSON.stringify(filedata.filesizebytes));
    setShowFileTransferProgress(true);
    datachannel.current!.bufferedAmountLowThreshold = CHUNK_SIZE * 3;
    filereader.current = new FileReader();
    let sentchunksize = 0;
    datachannel.current?.addEventListener("bufferedamountlow",function(){
      if(sentchunksize < selectedfile.size){
        chunkFile();
      }
    });
    filereader.current.addEventListener("load",function(){
      const filechunk = filereader.current!.result as ArrayBuffer;
      if(datachannel.current!.bufferedAmount <= HIGH_wATER_MARK){
        datachannel.current?.send(filechunk);
        setChunkSizeDelivered(prev => prev + ((filechunk.byteLength / selectedfile.size) * 100));
        sentchunksize += filechunk.byteLength;
        if(sentchunksize < selectedfile.size){
          chunkFile();
        }else{
          datachannel.current!.send(JSON.stringify({filename,mimetype}));
          setShowFileTransferProgress(false);
          setChunkSizeDelivered(0);
          toast.success("File transferred successfully",{
            icon:<CgCheckO size={40} className="text-green-500" />,
          }); 
        }
      }
    });
    function chunkFile(){
      if(filereader.current?.readyState !== 1){
        let filechunk = selectedfile!.slice(sentchunksize,sentchunksize+CHUNK_SIZE);
        filereader.current!.readAsArrayBuffer(filechunk);
      }
    }
    chunkFile();
    filereader.current.addEventListener("abort",function(){
      toast.error("File tranfer aborted");
      setChunkSizeDelivered(0);
    })
  }
  function getPeerID(e:React.ChangeEvent<HTMLInputElement>){
    const remotepeerID = e.target.value.trim();
    setRemotePeerID(remotepeerID);
    remotepeerIDref.current = remotepeerID;
  }
  function abortFileTransfer(){
    filereader.current!.abort();
  }
  return (
    <div className="min-h-screen">
      <ToastContainer
        className="text-[14px]"
        toastClassName={() =>
          `px-2 mb-4 border-l-4 flex rounded-[8px] min-h-10 shadow-lg shadow-slate-300/30 bg-white text-slate-500`
        }
        hideProgressBar
        autoClose={4000}
        closeButton={({ closeToast }) => (
          <MdOutlineClose
            size={30}
            className="cursor-pointer py-1 text-slate-500"
            onClick={closeToast}
          />
        )}
        position={"top-center"}
        transition={Slide}
        icon={<FcInfo size={40} />}
      />
      <nav className="py-3 border border-b-slate-300/60">
        <div className="w-[90%] mx-auto text-gray-600 flex justify-between">
          <header>
            <h1 className="text-xl text-gray-600">P2P File Transfer</h1>
          </header>
          <div className="flex items-center gap-x-3">
            <div className="px-3" title={`${connectionstate === "connected" ? "connected":"not connected"}`}>
              {(connectionstate === "connected") ? <PiPlugsConnected className="text-slate-400" size={30}/>:<PiPlugsLight  className="text-slate-400" size={30} />}
            </div>
            <SecondaryButton
              className={`${
                bootstate === "booted" &&
                `border-red-500/60 before:bg-red-500/40 text-[14px]`
              }`}
              onClick={handleConnection}
            >
              {bootstate === "booting" ? (
                <span>booting...</span>
              ) : bootstate === "off" ? (
                <span>start</span>
              ) : bootstate === "booted" ? (
                <span>stop</span>
              ) : (
                ""
              )}
            </SecondaryButton>
          </div>
        </div>
      </nav>
      <main className=" md:w-[85%] mx-auto pt-7 flex flex-col gap-y-4 text-slate-600">
        <Section className="py-5 gap-x-1 items-center">
          <Header headinglevel="h2">Connection ID: </Header>
          <GeneratedConnectionID
             tooltip={tooltip}
             ref={connectidelem}
             connectID={connectID} 
             copyPeerID={copyPeerID}
          />
        </Section>
        <Section className="py-5 flex-col">
          <RemotePeerIDPane 
            connectToPeer={connectToPeer} 
            getPeerID={getPeerID} 
            disabled={peerconnection.current === undefined || remotepeerID === ""}
          />
          { 
            connectionstateerror !== "" &&
            <ErrorDisplay message={connectionstateerror} />
          }
        </Section>
        <Section className="flex-col">
          <div className="border-b-slate-300/60 border-b py-3 flex flex-col justify-center">
            <Header headinglevel="h2">Connection</Header>
          </div>
          <ConnectionStatus 
            connectionstate={connectionstate} 
            remotepeerID={remotepeerID} 
          />
        </Section>
        <Section className="flex-col">
          <div className="border-b py-3 border-b-slate-300/60">
            <Header headinglevel="h2">Send File</Header>
          </div>
          <div className="py-5">
            <FileSelectInput selectFile={selectFile} ref={file} />
          </div>
          {
            filedata.filename !== "" && (
              <FileMetaData filename={filedata.filename} filesize={filedata.filesize} unit={filedata.unit} sendFile={sendFile} />
            )
          }
          {
            showfiletransferprogress && 
            <>
              <ProgressBar usertype={usertype} chunkedsizedelivered={chunkedsizedelivered}/>
              <button onClick={abortFileTransfer} className="hover:shadow-blue-400/70 px-10 py-2 my-5 hover:shadow-md bg-blue-500 rounded-[5px] duration-300 text-white w-fit">Abort</button>
            </>
          } 
        </Section>   
      </main>
    </div>
  );
}
