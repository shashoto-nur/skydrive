import React, { useState } from 'react';
import { Socket } from 'socket.io-client';

import { useAppSelector } from '../../app/hooks';
import { selectKey, selectAlgorithm } from '../login/loginSlice';
import { selectSocket } from '../../main/AppSlice';

import encryptFile from '../../helpers/encryptFile';
import { deriveKey, getAlgorithm, getDigest } from '../../utils';
import variables from '../../env';
import { selectSpaceInView } from '../view/viewSlice';

const Upload = () => {
    const socket = useAppSelector(selectSocket) as Socket;
    const key = useAppSelector(selectKey) as CryptoKey;
    const algorithm = useAppSelector(selectAlgorithm) as {
        name: string;
        iv: Uint8Array;
    };
    const space = useAppSelector(selectSpaceInView);

    const [file, setFile] = useState<'' | File>('');
    const [filename, setFilename] = useState('Choose A File');
    if(!space) return <>Space is missing</>;

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
        if (!file || !key)
            return alert(
                'Please provide a file and a passkey in order to encrypt!'
            );

        const chunkNum = Math.ceil(file.size / variables.CHUNK_SIZE);

        socket.emit(
            'upload_file',
            { name: filename, size: file.size, chunkNum, space: space._id },
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

    return (
        <>
            <h4> File upload </h4>

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

                <input type="button" value="Upload" onClick={encrypt} />
            </form>
        </>
    );
};

export default Upload;
