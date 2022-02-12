import React, { useEffect, useState } from 'react';
import { Socket } from "socket.io-client";

import { useAppSelector } from '../../app/hooks';
import styles from './Spaces.module.css';
import { selectApp } from '../../AppReducer';

import deriveKey from '../../utils/deriveKey';
import getAlgorithm from '../../utils/getAlgorithm';

interface ISpace {
    _id : string;
    name: string;
    preferences: string[];
    bookmarks: string[];
};

const Spaces = () => {
    const socket = useAppSelector(selectApp) as Socket;
    const [space, setSpace] = useState('New space');
    const [spaces, setSpaces] = useState(['']);
    const [spaceObjects, setSpaceObjects] = useState<ISpace[] | ''>('');

    const onSpaceChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSpace(event.target.value);
    };

    const createSpace = () => {
        if (space !== 'New space')
            socket.emit('create_space', { space });
        else alert('Enter a name for your space!');
    };

    const encryptArrayToStr = async (array: string[], algorithm: { name: string; iv: Uint8Array }, key: CryptoKey) => {
        const string = JSON.stringify(array)
        const uint8Arr = new TextEncoder().encode(string);
    
        const encBuffer = await window.crypto.subtle.encrypt(algorithm, key, uint8Arr);
        const encUint8Arr: any = new Uint8Array(encBuffer);
    
        const encString = String.fromCharCode.apply(null, encUint8Arr);
        const encBase64String = btoa(encString);
    
        return encBase64String;
    };

    const decryptStrToArray = async (encBase64String: string, algorithm: { name: string; iv: Uint8Array }, key: CryptoKey) => {
        const string: any = atob(encBase64String);
        const encUint8Arr = new Uint8Array(
            [...string].map((char) => char.charCodeAt(0))
        );
    
        const decBuffer = await window.crypto.subtle.decrypt(algorithm, key, encUint8Arr);
    
        const decUint8Arr = new Uint8Array(decBuffer);
        const decString = new TextDecoder().decode(decUint8Arr);
    
        return JSON.parse(decString);
    };

    useEffect(() => {
        let key: CryptoKey, algorithm: { name: string; iv: Uint8Array }
        (async () => {
            const passkey = localStorage.getItem('passkey');
            if(!passkey) return;
            key = await deriveKey(passkey) as CryptoKey;
            algorithm = getAlgorithm(passkey) as { name: string; iv: Uint8Array; };
        })();

        if(!socket) return;

        socket.on("GET_ENC_SPACES_RESPONSE", async ({ res }: { res: string }) => {
            try {
                if(!res) return;

                const spaceIds = await decryptStrToArray(res, algorithm, key);
                setSpaces(spaceIds);
                socket.emit('get_spaces', spaceIds);
            } catch (error) {
                console.log(error)
            }
        });

        socket.on("GET_SPACE_RESPONSE", ({ res }) => {
            setSpaceObjects(res);
        });

        socket.on("CREATE_SPACE_RESPONSE", async({ res }) => {
            if(res === '') return;
            const updatedSpaceIds = ([...spaces, res]).filter(e => e !== '');
            setSpaces(updatedSpaceIds);

            const encSpaceIds = await encryptArrayToStr(updatedSpaceIds, algorithm, key);
            socket.emit('add_space', encSpaceIds);
        });

        socket.on("ADD_SPACE_RESPONSE", ({ res }) => {
            console.log(res);
        });

        socket.emit('get_enc_spaces');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);
    

    return (
        <>
            <div className={styles.spaces}>
                <div className={styles.spaces_header}>
                    <h1>Spaces</h1>
                    { (spaceObjects) ?
                        spaceObjects.map((spaceObj, index) =>
                            <div key={index} className={styles.space}>
                                <h2>{spaceObj.name}</h2>
                            </div>
                        ) : <h2>No spaces</h2>
                    }
                </div>
            </div>

            <form onSubmit={ event => event.preventDefault() }>
                <input type="text" name="space" className={styles.textbox}
                    onChange={ onSpaceChange } placeholder={ space } />
                <button type="submit" className={styles.button}
                    onClick={ createSpace }>Create</button>
            </form>
        </>
    );
}

export default Spaces;