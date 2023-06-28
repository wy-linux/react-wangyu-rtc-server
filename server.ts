import https from "https";
import path from "path"
import fs from "fs"
import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import { roomHandler } from "./room";
const key  = fs.readFileSync(path.resolve(__dirname, '../ssl/wangyu.cloud.key'), 'utf8');
const cert = fs.readFileSync(path.resolve(__dirname, '../ssl/wangyu.cloud_bundle.crt'), 'utf8')
const options = {
    key,
    cert
}

const app = express();
app.use(cors);
const server = https.createServer(options, app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("用户连接成功！");
    roomHandler(socket);
});

server.listen(9000, () => {
    console.log(`listening on *:${9000}`);
});
