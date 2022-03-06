import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { useParams } from "react-router-dom";

import { useAppSelector } from "../../app/hooks";
import { selectSocket, selectSpaces } from "../../AppSlice";
import { selectKey, selectAlgorithm } from "../login/loginSlice";
import { IFile } from "./spaceSlice";

import decryptFile from "../../helpers/decryptFile";
import deriveKey from "../../utils/deriveKey";
import getAlgorithm from "../../utils/getAlgorithm";
import { encryptStr } from "../../utils/cryptoString";

const Space = () => {
    const { name } = useParams();

    const socket = useAppSelector(selectSocket) as Socket;
    const spaces = useAppSelector(selectSpaces);
    const key = useAppSelector(selectKey) as CryptoKey;
    const algorithm = useAppSelector(selectAlgorithm) as {
        name: string;
        iv: Uint8Array;
    };

    const [files, setFiles] = useState<IFile[]>([]);

    useEffect(() => {
        if (!socket) return;

        const space = spaces.find((s) => s.name === name);
        if (!space) return;

        let fileIds: string[] = space.entities.files;
        if (!fileIds) return;

        socket.emit("get_files", fileIds, ({ files }: { files: IFile[] }) =>
            setFiles(files)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getFile = (chunks: [{ number: number; id: string }], id: string) => {
        return async () => {
            const encId = await encryptStr(id, algorithm, key);

            const fileKey = await deriveKey(encId);
            const fileAlgo = getAlgorithm(encId);
            if (!fileKey || !fileAlgo) return alert("Try again");

            const result = await decryptFile({
                chunks,
                key: fileKey,
                algorithm: fileAlgo,
            });
            console.log(result);
        };
    };

    return (
        <>
            <h1>{ name }</h1>
            {files ? (
                files.map((file, index) => (
                    <div key={ index } onClick={ getFile(file.chunks, file._id) }>
                        <h2>{ file.name }</h2>
                        <p>{ file.size }</p>
                    </div>
                ))
            ) : (
                <h2>No files</h2>
            )}
        </>
    );
};

export default Space;
