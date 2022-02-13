import React, { useEffect, useState } from 'react';
import { Socket } from "socket.io-client";

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import styles from './Spaces.module.css';
import { selectApp } from '../../AppReducer';

import { selectAlgorithm, selectKey, setGlobalAlgorithm, setGlobalKey } from '../login/loginSlice';
import { setGlobalSpaces, ISpace, selectSpaces } from "./spacesSlice";

import deriveKey from '../../utils/deriveKey';
import getAlgorithm from '../../utils/getAlgorithm';
import { encryptStr, decryptStr } from '../../utils/cryptoString';

const Spaces = () => {
    const socket = useAppSelector(selectApp) as Socket;
    const selectorSpaces = useAppSelector(selectSpaces);
    const [spaces, setSpaces] = useState(selectorSpaces);
    const dispatch = useAppDispatch();
    let key = useAppSelector(selectKey) as CryptoKey;
    let algorithm = useAppSelector(selectAlgorithm) as { name: string; iv: Uint8Array; };

    const [space, setSpace] = useState('New space');
    const [spaceObjects, setSpaceObjects] = useState<ISpace[] | ''>('');

    const onSpaceChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSpace(event.target.value);
    };

    const createSpace = () => {
        if (space !== 'New space') socket.emit('create_space', { space });
        else alert('Enter a name for your space!');
    };

    const updateSpaces = async (newSpace: string) => {
        console.log(spaces);
        const updatedSpaces = [...spaces, newSpace].filter(el => el !== '');
        setSpaces(updatedSpaces as ISpace[]);

        const string = JSON.stringify(updatedSpaces);
        console.log(string)
        const encSpaceIds = await encryptStr(string, algorithm, key);

        return encSpaceIds;
    };

    useEffect(() => {
        if(!socket) return;
        (async() => {
            if(key && algorithm) return;
            const pin = prompt("Please enter your pin");
            if(!pin) return;
            const tempKey = await deriveKey(pin) as CryptoKey;
            const tempAlgorithm = getAlgorithm(pin) as { name: string; iv: Uint8Array; };

            const encPassword = localStorage.getItem('pin');
            if(!encPassword) return;
            const password = await decryptStr(encPassword, tempAlgorithm, tempKey);
    
            // eslint-disable-next-line react-hooks/exhaustive-deps
            algorithm = getAlgorithm(password) as { name: string; iv: Uint8Array; };
            // eslint-disable-next-line react-hooks/exhaustive-deps
            key = await deriveKey(password) as CryptoKey;
            dispatch(setGlobalKey(key));
            dispatch(setGlobalAlgorithm(algorithm));
        })();

        socket.on("GET_ENC_SPACES_RESPONSE", async ({ res }: { res: string }) => {
            try {
                if(!res) return;

                const decString = await decryptStr(res, algorithm, key);
                const spaceIds: ISpace[] = JSON.parse(decString);
                dispatch(setGlobalSpaces(spaceIds));

                setSpaces(spaceIds);
                socket.emit('get_spaces', spaceIds);
            } catch (error) {
                console.log(error);
            };
        });

        socket.on("GET_SPACE_RESPONSE", ({ res }) => {
            setSpaceObjects(res);
        });

        socket.on("CREATE_SPACE_RESPONSE", async({ res }: { res: string }) => {
            if(res === '') return;
            const updatedSpaces = await updateSpaces(res);
            socket.emit('add_space', updatedSpaces);
        });

        socket.on("ADD_SPACE_RESPONSE", ({ res }) => {
            console.log(res);
        });

        socket.emit('get_enc_spaces');

        return () => {
            socket.off('GET_ENC_SPACES_RESPONSE');
            socket.off('GET_SPACE_RESPONSE');
            socket.off('CREATE_SPACE_RESPONSE');
            socket.off('ADD_SPACE_RESPONSE');
        };

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
};

export default Spaces;