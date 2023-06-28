import { Socket } from "socket.io";
import { v4 as uuidV4 } from "uuid";

const rooms: Record<string, Record<string, IUser>> = {};
const chats: Record<string, IMessage[]> = {};
interface IUser {
    peerId: string;
    userName: string;
}
interface IRoomParams {
    roomId: string;
    peerId: string;
}

interface IJoinRoomParams extends IRoomParams {
    userName: string;
}
interface IMessage {
    content: string;
    author?: string;
    timestamp: number;
}
export const roomHandler = (socket: Socket) => {
    const createRoom = (userId: string) => {
        const roomId = uuidV4();
        rooms[roomId] = {};
        chats[roomId] = []
        socket.emit("room-created", roomId, userId);
        console.log("房间创建成功：", roomId);
    };
    const joinRoom = ({ roomId, userName, peerId }: IJoinRoomParams) => {
        if (!rooms[roomId]) {
            return socket.emit("error-joined", "房间不存在！")
        }
        if(rooms[roomId][peerId]) {
            return socket.emit("error-joined", "当前用户已经存在！")
        }
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

    const leaveRoom = ({ peerId, roomId }: IRoomParams) => {
        delete rooms[roomId][peerId]
        socket.to(roomId).emit("user-disconnected", peerId);
    }

    const addMessage = (roomId: string, message: IMessage) => {
        console.log({ message });
        if (chats[roomId]) {
            chats[roomId].push(message);
        } else {
            chats[roomId] = [message];
        }
        console.log('消息列表: ', chats[roomId])
        socket.to(roomId).emit("add-message", message);
    };

    const sendDrawData = (roomId: string, data: string) => {
        socket.to(roomId).emit("add-drawData", data);
    }
    const stopCamera = (roomId: string, peerId: string) => {
        socket.to(roomId).emit("camera-stopped", peerId)
    }
    socket.on("create-room", createRoom);
    socket.on("join-room", joinRoom);
    socket.on("send-message", addMessage);
    socket.on("send-drawData", sendDrawData)
    socket.on("stop-camera", stopCamera)
};
