import React, { useEffect, useState } from 'react';
import { Socket } from "socket.io-client";
import { useParams } from "react-router-dom";

import { useAppSelector } from '../../app/hooks';
import { selectSocket, selectSpaces } from '../../AppSlice';
import { IFile } from './spaceSlice';
import decryptFile from '../../helpers/decryptFile';
import { selectKey, selectAlgorithm } from '../login/loginSlice';

const Space = () => {
    const params = useParams();

    const socket = useAppSelector(selectSocket) as Socket;
    const spaces = useAppSelector(selectSpaces);
    const key = useAppSelector(selectKey) as CryptoKey;
    const algorithm = useAppSelector(selectAlgorithm) as { name: string; iv: Uint8Array; };

    const [files, setFiles] = useState<IFile[]>([]);
    
    
    useEffect(() => {
        if (!socket) return;

        const name = params.name;
        if(!name) return;

        const space = spaces.find(s => s.name === name);
        if(!space) return;

        let fileIds: string[] = space.entities.files;
        if(!fileIds) return;
        console.log(fileIds)
        socket.emit("get_files", fileIds, ({ files }: { files: IFile[] }) => {
            setFiles(files);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getFile = async(chunks: [{ number: number; id: string; }]) => {
        const result = await decryptFile({ chunks, key, algorithm });
        console.log(result);
    };

    return (
        <>
            <h1>{params.name}</h1>
            { (files) ?
                files.map((file, index) =>
                    <div key={index} onClick={() => getFile(file.chunks) } >
                        <h2>{file.name}</h2>
                        <p>{file.size}</p>
                    </div>
                ) : <h2>No files</h2>
            }
        </>
    );
}

export default Space;