import { Socket } from "socket.io-client";

export interface IBase {
    key: CryptoKey;
    algorithm: {
        name: string;
        iv: Uint8Array;
    };
    socket: Socket;
}

export interface IEncInit extends IBase {
    file: File;
    filename: string;
    id: string;
}

export interface IEncNUpload extends IBase {
    file: File;
    start: number;
    end: number;
    chunkNumber: number;
    id: string;
}

export interface IEncUpload {
    chunk: Uint8Array;
    number: number;
    id: string;
    socket: Socket;
}

export interface IDecInit extends IBase {
    chunks: [[number]];
    name: string;
}
export interface IDecNSave extends IBase {
    chunks: [[number]];
    writer: WritableStreamDefaultWriter<any>;
    number: number;
}
