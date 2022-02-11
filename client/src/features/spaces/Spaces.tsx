import React, { useEffect, useState } from 'react';
import { Socket } from "socket.io-client";

import { useAppSelector } from '../../app/hooks';
import styles from './Spaces.module.css';
import { selectApp } from '../../AppReducer';

import deriveKey from '../../utils/deriveKey';
import getAlgorithm from '../../utils/getAlgorithm';

const Spaces = () => {
    const socket = useAppSelector(selectApp) as Socket;
    const [space, setSpace] = useState('New space');
    const [spaces, setSpaces] = useState(['']);

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

    useEffect(() => {
        let key: CryptoKey, algorithm: { name: string; iv: Uint8Array }
        (async () => {
            key = await deriveKey('asdf1234') as CryptoKey;
            algorithm = getAlgorithm('asdf1234') as { name: string; iv: Uint8Array; };
        })();
        if(socket) {
            socket.on("GET_ENC_SPACES_RESPONSE", async ({ res }: { res: string }) => {
                console.log("GET_ENC_SPACES_RESPONSE: ", { res });
                if(!res) return;
                
                const spacesArr = new TextEncoder().encode(res);
                
                const spaceIdsBuffer = await window.crypto.subtle.decrypt(algorithm, key, spacesArr);
                const spaceIds = Array.from(spaceIdsBuffer);
                setSpaces(spaceIds as string[]);
                socket.emit('get_spaces', spaceIds);
            });
            socket.on("GET_SPACE_RESPONSE", ({ res }) => {
                console.log("Get_Space response: ", { res });
            });
            socket.on("CREATE_SPACE_RESPONSE", async({ res }) => {
                console.log("Create_Space response: ", { res });
                if(res === '') return;
                const updatedSpaces = [...spaces, res];
                const spacesArr = Uint8Array.from(updatedSpaces);

                const encSpacesBuffer = await window.crypto.subtle.encrypt(algorithm, key, spacesArr);
                const encSpaceIds = new TextDecoder().decode(encSpacesBuffer);
                socket.emit('add_space', encSpaceIds);
            });
            socket.on("ADD_SPACE_RESPONSE", ({ res }) => {
                console.log(res)
            });
            socket.emit('get_enc_spaces');
        }
    }, [socket, spaces]);
    

    return (
        <>
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