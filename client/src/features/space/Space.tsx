import { useState } from "react";
import { Socket } from "socket.io-client";
import { useParams } from "react-router-dom";

import { useAppSelector } from "../../app/hooks";
import { selectSocket, selectSpaces } from "../../main/AppSlice";
import { selectKey, selectAlgorithm } from "../login/loginSlice";
import { IFile } from "./spaceSlice";

import decryptFile from "../../helpers/decryptFile";
import deriveKey from "../../utils/deriveKey";
import getAlgorithm from "../../utils/getAlgorithm";
import getDigest from "../../utils/getDigest";

const Space = () => {
    const { name } = useParams();

    const socket = useAppSelector(selectSocket) as Socket;
    const spaces = useAppSelector(selectSpaces);
    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);

    const [files, setFiles] = useState<IFile[] | "">("");

    if (!socket || !key || !algorithm) return <></>;

    const space = spaces.find((s) => s.name === name);
    if (!space) return <></>;

    let fileIds: string[] = space.entities.files;
    if (!fileIds) return <></>;

    if (!files) {
        socket.emit("get_files", fileIds, ({ files }: { files: IFile[] }) => {
            console.log(files)
            setFiles(files);
        });
    }

    const createLink = ({ id }: { id: string }) => {
        return async () => {
            const digest = await getDigest({ id, algorithm, key });
            const source = { id, digest };

            const link = btoa(JSON.stringify(source));
            const base = window.location.origin + "/file/";
            await navigator.clipboard.writeText(base + link);

            alert("Link copied to clipboard!");
        };
    };

    const getFile = (name: string, chunks: [[number]], id: string) => {
        return async () => {
            const digest = await getDigest({ id, algorithm, key });

            const fileKey = await deriveKey(digest);
            const fileAlgo = getAlgorithm(digest);
            if (!fileKey || !fileAlgo) return alert("Try again");

            const result = await decryptFile({
                chunks,
                socket,
                name,
                key: fileKey,
                algorithm: fileAlgo,
            });
            console.log(result);
        };
    };

    return (
        <>
            <h1>{name}</h1>
            {files ? (
                files.map((file, index) => (
                    <div
                        key={index}
                        onClick={getFile(file.name, file.chunks, file._id)}
                    >
                        <h2>{file.name}</h2>
                        <p>{file.size}</p>
                        <button onClick={createLink({ id: file._id })}>
                            Share
                        </button>
                    </div>
                ))
            ) : (
                <h2>No files</h2>
            )}
        </>
    );
};

export default Space;
