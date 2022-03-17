import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { useParams } from 'react-router-dom';

import { useAppSelector } from '../../app/hooks';
import { selectSocket, selectSpaces } from '../../main/AppSlice';
import { selectKey, selectAlgorithm } from '../login/loginSlice';
import { IFile } from './viewSlice';

import decryptFile from '../../helpers/decryptFile';
import { deriveKey, getAlgorithm, getDigest } from '../../utils';
import encryptFile from '../../helpers/encryptFile';
import variables from '../../env';

const Space = () => {
    const { location } = useParams();

    const socket = useAppSelector(selectSocket) as Socket;
    const spaces = useAppSelector(selectSpaces);
    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);

    const [files, setFiles] = useState<IFile[] | ''>('');
    const [incompleteFiles, setIncompleteFiles] = useState<IFile[] | ''>('');

    const [recoveringId, setRecoveringId] = useState<string>('');
    const [missing, setMissing] = useState<number>(-1);
    const [reFile, setReFile] = useState<'' | File>('');
    const [reFilename, setReFilename] = useState('Choose A File');

    const [partialDown, setPartialDown] = useState<'' | File>('');

    const selectRecoveryFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event?.target?.files![0]) {
            setReFile(event.target.files![0]);
            setReFilename(event.target.files![0].name);
        }
    };

    const selectPartialDown = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event?.target?.files![0]) {
            setPartialDown(event.target.files![0]);
        }
    };

    if (!socket || !key || !algorithm) return <></>;
    const selectRecoveringId = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedIndex = event.target.options.selectedIndex;
        const selectElement = event.target.options[selectedIndex];

        const chunkArr = JSON.parse(selectElement.id);
        const missingIndex = chunkArr.indexOf(undefined);

        setMissing(missingIndex);
        setRecoveringId(event.target.value);
    };

    const recover = async () => {
        const id = recoveringId;
        if (!reFile || !key || !algorithm)
            return alert(
                'Please provide a file and a passkey in order to encrypt!'
            );

        const digest = await getDigest({ id, algorithm, key });
        const fileKey = await deriveKey(digest);
        const fileAlgo = getAlgorithm(digest);
        if (!fileKey || !fileAlgo) return alert('Try again');
        if (!id) return alert('Please select a file to recover');
        if (missing === -1) return alert('Please select a file to recover');

        await encryptFile({
            id,
            file: reFile,
            filename: reFilename,
            key: fileKey,
            algorithm: fileAlgo,
            socket,
            startFrom: missing,
        });
    };

    const space = spaces.find((s) => s.name === location);
    if (!space) return <></>;

    let fileIds: string[] = space.entities.files;
    if (!fileIds) return <></>;

    if (!files) {
        socket.emit(
            'get_files',
            fileIds,
            ({
                files,
                incompleteFiles,
            }: {
                files: IFile[];
                incompleteFiles: IFile[];
            }) => {
                setFiles(files);
                setIncompleteFiles(incompleteFiles);
            }
        );
    }

    const createLink = ({ id }: { id: string }) => {
        return async () => {
            const digest = await getDigest({ id, algorithm, key });
            const source = { id, digest };

            const link = btoa(JSON.stringify(source));
            const base = window.location.origin + '/file/';
            await navigator.clipboard.writeText(base + link);

            alert('Link copied to clipboard!');
        };
    };

    const download = (name: string, chunks: [[number]], id: string) => {
        return async () => {
            const digest = await getDigest({ id, algorithm, key });

            const fileKey = await deriveKey(digest);
            const fileAlgo = getAlgorithm(digest);
            if (!fileKey || !fileAlgo) return alert('Try again');

            const startFrom = partialDown
                ? partialDown.size / variables.CHUNK_SIZE
                : 0;

            decryptFile({
                chunks,
                socket,
                name,
                key: fileKey,
                algorithm: fileAlgo,
                startFrom,
                partialDown,
            });
        };
    };

    return (
        <>
            <h2>{location}</h2>

            {incompleteFiles && (
                <>
                    <h6>Incomplete files</h6>

                    <form onSubmit={(event) => event.preventDefault()}>
                        {reFile === ''
                            ? 'Choose a File'
                            : `${reFilename.substring(0, 30)}${
                                  reFilename.length > 30 ? '...' : ''
                              }`}
                        <input
                            type="file"
                            id="file"
                            name="file"
                            onChange={selectRecoveryFile}
                        />

                        <select onChange={selectRecoveringId}>
                            {incompleteFiles.map(({ _id, name, chunks }) => (
                                <option
                                    id={JSON.stringify(chunks)}
                                    key={_id}
                                    value={_id}
                                >
                                    {name}
                                </option>
                            ))}
                        </select>

                        <input type="button" value="Upload" onClick={recover} />
                    </form>
                </>
            )}
            {files ? (
                files.map((file, index) => (
                    <div key={index}>
                        <h3>{file.name}</h3>
                        <p>Size: {Math.ceil(file.size / (1024 * 1024))} mb</p>

                        <input type="file" onChange={selectPartialDown} />
                        <button onClick={createLink({ id: file._id })}>
                            Share
                        </button>
                        <button
                            onClick={download(file.name, file.chunks, file._id)}
                        >
                            Download
                        </button>
                    </div>
                ))
            ) : (
                <h3>No files</h3>
            )}
        </>
    );
};

export default Space;
