import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import url from "url";
import { v4 as uuidV4 } from "uuid";

const server = http.createServer();
const wss = new WebSocketServer({ server });

const connections: Record<string, WebSocket> = {};
const users: Record<string, User> = {};
const webrtcConnections: Record<string, string> = {};

type OutgoingMessage = {
    type: "broadcast" | "rtc";
    payload: any;
};

type MsgType = "offer" | "answer" | "iceCandidate";

type RTCMessage = {
    type: MsgType;
    to?: string;
    sdp?: RTCSessionDescriptionInit;
    ice?: RTCIceCandidateInit;
};

type User = {
    username: string;
};

wss.on("connection", (connection: WebSocket, request: http.IncomingMessage): void => {
    const query = url.parse(request.url || "", true).query;
    const username = query.username as string;

    if (!username) {
        console.log("Connection attempt without username. Connection closed.");
        connection.close();
        return;
    }

    const uuid = uuidV4();
    console.log(`${username} connected with ID: ${uuid}`);

    connections[uuid] = connection;
    users[uuid] = { username };

    broadcast();

    // Handle incoming messages
    connection.on("message", (message: Buffer) => handleMessage(message, uuid));

    // Cleanup on disconnect
    connection.on("close", () => handleClose(uuid));

    connection.on("error", (error) => {
        console.error(`Error on connection ${uuid}:`, error.message);
    });
});

// Handle incoming WebRTC messages
const handleMessage = (bytes: Buffer, uuid: string): void => {
    const message: RTCMessage = JSON.parse(bytes.toString());
    const user = users[uuid];

    if (!user) {
        console.error(`User with ID: ${uuid} not found.`);
        return;
    }

    if (message.type === "offer") {
        if (!message.to) {
            console.error("Recipient ID missing in offer message.");
            return;
        }
        // Store WebRTC connections
        webrtcConnections[uuid] = message.to;
        webrtcConnections[message.to] = uuid;

        const recipientConnection = connections[message.to];
        if (!recipientConnection) {
            console.error(`Recipient connection ${message.to} not found.`);
            return;
        }

        const response: OutgoingMessage = {
            type: "rtc",
            payload: message,
        };
        recipientConnection.send(JSON.stringify(response));
        console.log(`Offer sent from ${uuid} to ${message.to}`);
    } else if (message.type === "iceCandidate" || message.type === "answer") {
        console.log(`${message.type} received from: ${uuid}`);

        const recipientId = webrtcConnections[uuid];
        const recipientConnection = connections[recipientId];
        if (!recipientConnection) {
            console.error(`Recipient connection ${recipientId} not found.`);
            return;
        }

        const response: OutgoingMessage = {
            type: "rtc",
            payload: message,
        };
        recipientConnection.send(JSON.stringify(response));
        console.log(`${message.type} forwarded to ${recipientId}`);
    }
};

// Handle WebSocket disconnections
const handleClose = (uuid: string): void => {
    const user = users[uuid];

    if (!user) {
        console.error(`Attempt to remove non-existing user ID: ${uuid}`);
        return;
    }

    console.log(`User ${user.username} (ID: ${uuid}) disconnected.`);

    // Clean up WebSocket connections and WebRTC mappings
    delete connections[uuid];
    delete users[uuid];

    const peerId = webrtcConnections[uuid];
    if (peerId) {
        delete webrtcConnections[peerId];
        delete webrtcConnections[uuid];
        console.log(`Removed WebRTC mapping for ${uuid} and ${peerId}`);
    }

    broadcast();
};

// Broadcast updated user list to all connected clients
const broadcast = (): void => {
    const message: OutgoingMessage = {
        type: "broadcast",
        payload: users,
    };

    Object.keys(connections).forEach((uuid) => {
        const connection = connections[uuid];
        if (connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify(message));
        }
    });
    console.log("Broadcasted updated user list.");
};

server.listen(8000, () => {
    console.log("WebSocket server is running on port 8000");
});
