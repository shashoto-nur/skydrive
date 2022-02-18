import React, { useEffect, useState } from 'react';
import { Socket } from "socket.io-client";

import { useAppSelector } from '../../app/hooks';
import styles from './Spaces.module.css';
import { selectSocket } from '../../AppSlice';

import { selectAlgorithm, selectKey } from '../login/loginSlice';
import { ISpace } from "./spacesSlice";

import { encryptStr, decryptStr } from '../../utils/cryptoString';

const Spaces = () => {
    const socket = useAppSelector(selectSocket) as Socket;

    const key = useAppSelector(selectKey) as CryptoKey;
    const algorithm = useAppSelector(selectAlgorithm) as { name: string; iv: Uint8Array; };

    const [space, setSpace] = useState('New space');
    const [spaceObjects, setSpaceObjects] = useState<ISpace[] | ''>('');

    const onSpaceChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSpace(event.target.value);
    };

    const createSpace = () => {
        if (space !== 'New space') socket.emit('create_space', { space }, async({ spaceIds }: { spaceIds: string[] }) => {
            const string = JSON.stringify(spaceIds);
            const updatedSpaces = await encryptStr(string, algorithm, key);
            socket.emit('add_space', updatedSpaces, ({ res }: { res: string }) => {
                console.log(res);
            });
        });
        else alert('Enter a name for your space!');
    };

    useEffect(() => {
        if(!socket) return;

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