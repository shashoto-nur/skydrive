import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

import { useAppSelector } from '../../app/hooks';
import { selectSocket, selectSpaces } from '../../main/AppSlice';

import { selectAlgorithm, selectKey } from '../login/loginSlice';
import { ISpace } from './spacesSlice';

import { encryptStr } from '../../utils/cryptoString';
import { Link } from 'react-router-dom';

const Spaces = () => {
    const selectedSocket = useAppSelector(selectSocket);

    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);

    const [space, setSpace] = useState('New space');
    const [spaceObjects, setSpaceObjects] = useState<ISpace[] | ''>('');
    const spacesSelected = useAppSelector(selectSpaces);

    useEffect(() => {
        setSpaceObjects(spacesSelected);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spacesSelected]);

    if (!selectedSocket || !key || !algorithm) return <></>;
    const socket = selectedSocket as Socket;

    const onSpaceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSpace(event.target.value);
    };

    const createSpace = () => {
        if (space === 'New space') return alert('Enter a name for your space!');

        socket.emit(
            'create_space',
            { space },
            async ({ spaceIds }: { spaceIds: string[] }) => {
                const string = JSON.stringify(spaceIds);
                const updatedSpaces = await encryptStr(string, algorithm, key);
                socket.emit(
                    'add_space',
                    updatedSpaces,
                    ({ res }: { res: string }) => {
                        console.log(res);
                    }
                );
            }
        );
    };

    return (
        <>
            <div className="spaces">
                <div className="spaces_header">
                    <h1>Spaces</h1>
                    {spaceObjects ? (
                        spaceObjects.map((spaceObj, index) => (
                            <div key={index} className="space">
                                <Link to={'../space/' + spaceObj.name}>
                                    <h2>{spaceObj.name}</h2>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <h2>No spaces</h2>
                    )}
                </div>
            </div>

            <form onSubmit={(event) => event.preventDefault()}>
                <input
                    type="text"
                    name="space"
                    className="textbox"
                    onChange={onSpaceChange}
                    placeholder={space}
                />
                <button type="submit" className="button" onClick={createSpace}>
                    Create
                </button>
            </form>
        </>
    );
};

export default Spaces;
