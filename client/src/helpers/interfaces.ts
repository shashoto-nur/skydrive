import { Socket } from 'socket.io-client';

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
    startFrom: number;
}

export interface IEncNUpload extends IBase {
    file: File;
    start: number;
    end: number;
    chunkNumber: number;
    id: string;
    chunkArray: [[number]];
    recovery: boolean;
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
    startFrom: number;
    partialDown: string | File;
}
export interface IDecNSave extends IBase {
    chunks: [[number]];
    writer: WritableStreamDefaultWriter<any>;
    number: number;
}
