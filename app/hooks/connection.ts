import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

interface ConnectionProps{
    connectID: string,
    socket:Socket
    peerconnection:RTCPeerConnection
    datachannel:RTCDataChannel
}
export default function useConnection({connectID,socket,peerconnection,datachannel}:ConnectionProps){
    const peerIDref = useRef("");
    const receivedfilelength = useRef(0);
    const [chunkedsizedelivered,setChunkSizeDelivered] = useState(0);
    const [showfiletransferprogress,setShowFileTransferProgress] = useState(false);
    const [peerID,setPeerID] = useState("");

    function receiveFile({data}:MessageEvent,filechunks:ArrayBuffer[]){
        if(data instanceof ArrayBuffer){
          setChunkSizeDelivered(prev=>prev + (data.byteLength / receivedfilelength.current) * 100)
          filechunks.push(data);
        }else{
          const receiveddata = JSON.parse(data);
          if(typeof receiveddata === 'number'){
            setShowFileTransferProgress(true);
            receivedfilelength.current = parseInt(data,10);
          }else{
            setShowFileTransferProgress(false);
            const {mimetype,filename} = JSON.parse(data);
            const file = new Blob(filechunks,{type:mimetype});
            filechunks.length = 0; //empty the array
            const link = Object.assign(document.createElement("a"),{
              href: URL.createObjectURL(file),
              download: filename,
            });
            link.click();
            URL.revokeObjectURL(link.href); 
          }
        }
    }
    useEffect(function(){
        if(socket){
            socket.on("offer", async function({offer,peerID}){
              peerIDref.current = peerID;
              setPeerID(peerID);
              peerconnection?.addEventListener("datachannel",function({channel}:RTCDataChannelEvent){
                datachannel = channel;
                datachannel.addEventListener("open",function(e){
                    const datachannelstate = datachannel.readyState;
                    switch(datachannelstate){
                        case "connecting":
                            break;
                        case "open":
                            console.log("channel with peer opened");
                            break;
                        case "closed":
                    }
                });
                  let filechunks:ArrayBuffer[] = [];
                  datachannel.addEventListener("message",(e:MessageEvent)=>receiveFile(e,filechunks));              
                });
                await peerconnection?.setRemoteDescription(offer),
                await peerconnection?.setLocalDescription();
                socket.emit("answer",{
                  answer:peerconnection?.localDescription,
                  peerID
              });   
            });
            socket.on("answer", function({answer}){
              console.log("answer:",answer);
              peerconnection?.setRemoteDescription(answer);
            })
        }
    },[connectID])
    return 
}