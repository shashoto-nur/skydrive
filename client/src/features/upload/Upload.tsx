
import React, { useState, useEffect } from 'react';

import encryptFile from '../../helpers/encryptFile';
import { useAppSelector } from '../../app/hooks';
import { selectKey, selectAlgorithm } from '../login/loginSlice';
import { Socket } from 'socket.io-client';
import { selectSocket } from '../../AppSlice';
import { decryptStr, encryptStr } from '../../utils/cryptoString';
import deriveKey from '../../utils/deriveKey';
import getAlgorithm from '../../utils/getAlgorithm';
import { ISpace } from '../spaces/spacesSlice';


const Upload = () => {
    const socket = useAppSelector(selectSocket) as Socket;
    const key = useAppSelector(selectKey) as CryptoKey;
    const algorithm = useAppSelector(selectAlgorithm) as { name: string; iv: Uint8Array; };

    const [file, setFile] = useState<"" | File>('');
    const [filename, setFilename] = useState('Choose A File');
    const [spaceObjects, setSpaceObjects] = useState<ISpace[]>([]);
    const [space, setSpace] = useState<string | null>(null);

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event?.target?.files![0]) {
            setFile(event.target.files![0]);
            setFilename(event.target.files![0].name);
        };
    };

    const clickFileInput = (event: React.KeyboardEvent<HTMLLabelElement>) => {
        if(event.key === ' ' || event.key === 'Enter') document.getElementById('file')?.click();
    };

    const encrypt = () => {
        if(!file || !key || !space) return alert('Please provide a file and a passkey in order to encrypt!');

        socket.emit('upload_file', { name: filename, size: file.size, space }, async ({ id }: { id: string }) => {
            const encId = await encryptStr(id, algorithm, key);
            const fileKey = await deriveKey(encId) as CryptoKey;
            const fileAlgo = getAlgorithm(encId) as { name: string; iv: Uint8Array; };

            encryptFile({ file, filename, key: fileKey, algorithm: fileAlgo, id });
        });
    };

    const selectSpace = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSpace(event.target.value);
    };

    useEffect(() => {
        socket.emit('get_enc_spaces', async ({ res }: { res: string }) => {
            try {
                if(!res) return;

                const decString = await decryptStr(res, algorithm, key);
                const receivedSpaces: string[] = JSON.parse(decString);

                socket.emit('get_spaces', receivedSpaces, ({ res }: { res: ISpace[] }) => {
                    setSpaceObjects(res);
                });
            } catch (error) {
                console.log(error);
            };
        });
    }, [algorithm, key, socket]);
    

    return (
        <>
            <h1> File upload </h1>

            <form onSubmit={ event => event.preventDefault() }>
                <label htmlFor="file" id="file-label" tabIndex={ 0 } onKeyPress={ clickFileInput } >
                    {
                        file === ''
                            ? 'Choose a File'
                            : `${ filename.substring(0, 30) }${ filename.length > 30 ? '...' : '' }`
                    }
                    <input type='file' id="file" name="file" onChange={ onFileChange } />
                </label>
                <select onChange={ selectSpace }>
                    {
                        spaceObjects.map(({ _id, name }) => (
                            <option key={ _id } value={ _id }>{ name }</option>
                        ))
                    }
                </select>

                <input type='button' value='Upload' onClick={ encrypt } />
            </form>
        </>
    );

};

export default Upload;