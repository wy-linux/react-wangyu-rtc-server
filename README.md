### Node + Socket.IO + Peer-Server 多人房间实时通信后端接口
```shell
1. npm install  下载相关依赖
2. npm run start 启动接口
```
##### Socket.IO房间管理
```javascript
const joinRoom = ({ roomId, userName, peerId }: IJoinRoomParams) => {
    if (!rooms[roomId]) rooms[roomId] = {};
    if (!chats[roomId]) chats[roomId] = [];

    console.log("用户加入: ",  userName);
    rooms[roomId][peerId] = { peerId, userName };

    socket.emit("get-users", {
        roomId,
        participants: rooms[roomId],
    });
    socket.emit("get-messages", chats[roomId]);
    // socket加入房间
    socket.join(roomId);
    // 向房间内其他socket广播消息
    socket.to(roomId).emit("user-joined", { peerId, userName });

    socket.on("disconnect", () => {
        console.log("用户离开房间： ", peerId);
        leaveRoom({ roomId, peerId });
    });
    }; 
```
##### Peer-Server自建WebRTC信令服务
```javascript
import { PeerServer } from "peer";
PeerServer({ port: 9001, path: "/" });
```