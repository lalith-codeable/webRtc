type User = {
    username: string;
};

type Users = Record<string, User>

type MsgType = "answer" | "iceCandidate" | "connect" | "disconnect" | "reject" | "approve";

type IncomingMessage = {
    type: "broadcast" | "rtc";
    payload: any;
};

type BroadcastPayload = Record<string, User>;

type RTCMessage = {
    type: MsgType;
    recipient?: string;
    sdp?: RTCSessionDescriptionInit;
    ice?: RTCIceCandidateInit;
    sender?: string;
};

export type {
    User,
    Users,
    MsgType,
    IncomingMessage, 
    BroadcastPayload, 
    RTCMessage
}



