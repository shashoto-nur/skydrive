import React, { useEffect, useState } from 'react';
import { Socket } from "socket.io-client";
import { useParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSocket, selectSpaces } from '../../AppSlice';
import { IFile } from './spaceSlice';
import decryptFile from '../../helpers/decryptFile';
import { selectKey, selectAlgorithm } from '../login/loginSlice';

const Space = () => {
    const dispatch = useAppDispatch();
    const params = useParams();

    const socket = useAppSelector(selectSocket) as Socket;
    const spaces = useAppSelector(selectSpaces);
    const key = useAppSelector(selectKey) as CryptoKey;
    const algorithm = useAppSelector(selectAlgorithm) as { name: string; iv: Uint8Array; };

    const [fileIds, setFileIds] = useState([""]);
    const [files, setFiles] = useState<IFile[]>([]);

    spaces.forEach(space => {
        if (space.name === params.space)
            setFileIds(space.entities.files);
    });

    useEffect(() => {
        if (!socket) return;

        if(fileIds.length > 0 && fileIds[0] !== '') {
            socket.emit("get_files", fileIds, ({ files }: { files: IFile[] }) => {
                setFiles(files);
            });
        };
    }, [socket, dispatch, fileIds]);

    return (
        <>
            <h1>{params.name}</h1>
            { (files) ?
                files.map((file, index) =>
                    <div key={index} onClick={() => decryptFile({ chunks: file.chunks, key, algorithm }) } >
                        <h2>{file.name}</h2>
                        <p>{file.size}</p>
                    </div>
                ) : <h2>No files</h2>
            }
        </>
    );
}

export default Space;