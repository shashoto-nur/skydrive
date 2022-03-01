import React, { useEffect, useState } from 'react';
import { Socket } from "socket.io-client";

import { useAppSelector } from '../../app/hooks';
import styles from './Spaces.module.css';
import { selectSocket, selectSpaces } from '../../AppSlice';

import { selectAlgorithm, selectKey } from '../login/loginSlice';
import { ISpace } from "./spacesSlice";

import { encryptStr } from '../../utils/cryptoString';
import { Link } from 'react-router-dom';

const Spaces = () => {
    const socket = useAppSelector(selectSocket) as Socket;

    const key = useAppSelector(selectKey) as CryptoKey;
    const algorithm = useAppSelector(selectAlgorithm) as { name: string; iv: Uint8Array; };

    const [space, setSpace] = useState('New space');
    const [spaceObjects, setSpaceObjects] = useState<ISpace[] | ''>('');
    const spacesSelected = useAppSelector(selectSpaces) as ISpace[];

    useEffect(() => {
      setSpaceObjects(spacesSelected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    

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
    
    return (
        <>
            <div className={styles.spaces}>
                <div className={styles.spaces_header}>
                    <h1>Spaces</h1>
                    { (spaceObjects) ?
                        spaceObjects.map((spaceObj, index) =>
                            <div key={index} className={styles.space}>
                                <Link to={'../space/' + spaceObj.name} >
                                    <h2>{spaceObj.name}</h2>
                                </Link>
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