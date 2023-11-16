import { NextResponse,NextRequest } from "next/server";
import { Server } from "socket.io";

function GET(req:NextRequest,res:Response){
    const io = new Server();
    const socket = io.on("connection",function)
}