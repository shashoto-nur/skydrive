import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

import { useAppSelector } from '../../app/hooks';
import { selectKey, selectAlgorithm } from '../login/loginSlice';
import { selectSocket, selectSpaces } from '../../main/AppSlice';
import { ISpace } from '../spaces/spacesSlice';

import encryptFile from '../../helpers/encryptFile';
import { deriveKey, getAlgorithm, getDigest } from '../../utils';
import variables from '../../env';

const Upload = () => {
    const socket = useAppSelector(selectSocket) as Socket;
    const key = useAppSelector(selectKey) as CryptoKey;
    const algorithm = useAppSelector(selectAlgorithm) as {
        name: string;
        iv: Uint8Array;
    };

    const [file, setFile] = useState<'' | File>('');
    const [filename, setFilename] = useState('Choose A File');
    const [spaceObjects, setSpaceObjects] = useState<ISpace[]>([]);
    const [space, setSpace] = useState<string | null>(null);

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

    const encrypt = () => {
        if (!file || !key || !space)
            return alert(
                'Please provide a file and a passkey in order to encrypt!'
            );
        
        const chunkNum = Math.ceil(file.size / variables.CHUNK_SIZE);

        socket.emit(
            'upload_file',
            { name: filename, size: file.size, chunkNum, space },
            async ({ id }: { id: string }) => {
                const digest = await getDigest({ id, algorithm, key });

                const fileKey = await deriveKey(digest);
                const fileAlgo = getAlgorithm(digest);
                if (!fileKey || !fileAlgo) return alert('Try again');

                encryptFile({
                    file,
                    filename,
                    key: fileKey,
                    algorithm: fileAlgo,
                    id,
                    socket,
                    startFrom: 0,
                });
            }
        );
    };

    const selectSpace = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSpace(event.target.value);
    };

    const spaces = useAppSelector(selectSpaces);
    useEffect(() => {
        if (!spaces) return;
        setSpaceObjects(spaces);
    }, [spaces]);

    return (
        <>
            <h1> File upload </h1>

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
                <select onChange={selectSpace}>
                    {spaceObjects.map(({ _id, name }) => (
                        <option key={_id} value={_id}>
                            {name}
                        </option>
                    ))}
                </select>

                <input type="button" value="Upload" onClick={encrypt} />
            </form>
        </>
    );
};

export default Upload;
