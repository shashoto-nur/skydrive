import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { useParams } from 'react-router-dom';

import { useAppSelector } from '../../app/hooks';
import { selectSocket, selectSpaces } from '../../main/AppSlice';
import { selectKey, selectAlgorithm } from '../login/loginSlice';
import { IFile } from './spaceSlice';

import decryptFile from '../../helpers/decryptFile';
import deriveKey from '../../utils/deriveKey';
import getAlgorithm from '../../utils/getAlgorithm';
import getDigest from '../../utils/getDigest';
import encryptFile from '../../helpers/encryptFile';

const Space = () => {
    const { name } = useParams();

    const socket = useAppSelector(selectSocket) as Socket;
    const spaces = useAppSelector(selectSpaces);
    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);

    const [files, setFiles] = useState<IFile[] | ''>('');
    const [incompleteFiles, setIncompleteFiles] = useState<IFile[] | ''>('');
    const [recoveringId, setRecoveringId] = useState<string>('');
    const [missing, setMissing] = useState<number>(-1);
    const [file, setFile] = useState<'' | File>('');
    const [filename, setFilename] = useState('Choose A File');

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event?.target?.files![0]) {
            setFile(event.target.files![0]);
            setFilename(event.target.files![0].name);
        }
    };

    const clickFileInput = (event: React.KeyboardEvent<HTMLLabelElement>) => {
        if (event.key === ' ' || event.key === 'Enter')
            document.getElementById('file')?.click();
    };

    if (!socket || !key || !algorithm) return <></>;
    const selectRecoveringId = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIndex = event.target.options.selectedIndex;
        const selectElement = event.target.options[selectedIndex];

        const chunkArr = JSON.parse(selectElement.id);
        const missingIndex = chunkArr.indexOf(undefined);

        setMissing(missingIndex);
        setRecoveringId(event.target.value);
    };

    const recover = async () => {
        const id = recoveringId;
        if (!file || !key || !algorithm)
            return alert(
                'Please provide a file and a passkey in order to encrypt!'
            );
        
        const digest = await getDigest({ id, algorithm, key });
        const fileKey = await deriveKey(digest);
        const fileAlgo = getAlgorithm(digest);
        if (!fileKey || !fileAlgo) return alert('Try again');
        if(!id) return alert('Please select a file to recover');
        if(missing === -1) return alert('Please select a file to recover');

        await encryptFile({
            id,
            file,
            filename,
            key: fileKey,
            algorithm: fileAlgo,
            socket,
            startFrom: missing,
        });
    }


    const space = spaces.find((s) => s.name === name);
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

            decryptFile({
                chunks,
                socket,
                name,
                key: fileKey,
                algorithm: fileAlgo,
            });
        };
    };

    return (
        <>
            <h6>{name}</h6>

            {incompleteFiles && (
                <>
                    <h6>Incomplete files</h6>

                    <form onSubmit={(event) => event.preventDefault()}>
                        <label
                            htmlFor="file"
                            id="file-label"
                            tabIndex={0}
                            onKeyPress={clickFileInput}
                        >
                            {file === ''
                                ? 'Choose a File'
                                : `${filename.substring(0, 30)}${
                                      filename.length > 30 ? '...' : ''
                                  }`}
                            <input
                                type="file"
                                id="file"
                                name="file"
                                onChange={onFileChange}
                            />
                        </label>

                        <select onChange={selectRecoveringId}>
                            {incompleteFiles.map(({ _id, name, chunks }) => (
                                <option id={JSON.stringify(chunks)} key={_id} value={_id}>
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
                    <div
                        key={index}
                        onClick={download(file.name, file.chunks, file._id)}
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
