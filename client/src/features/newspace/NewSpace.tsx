import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import { useAppSelector } from '../../app/hooks';
import { selectSocket, selectUserId } from '../../main/AppSlice';
import { selectAlgorithm, selectKey } from '../login/loginSlice';

import { encryptStr, slugify } from '../../utils';

declare global {
    interface Crypto {
        randomUUID: () => string;
    }
}

const NewSpace = () => {
    const { baseSpace } = useParams();
    const selectedSocket = useAppSelector(selectSocket);

    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);
    const userId = useAppSelector(selectUserId);

    const [space, setSpace] = useState('New space');
    const [personal, setPersonal] = useState(true);

    if (!selectedSocket || !key || !algorithm) return <>Eh...</>;
    const socket = selectedSocket as Socket;

    const onSpaceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSpace(event.target.value);
    };

    const createSpace = async () => {
        if (space === 'New space') return alert('Enter a name for your space!');
        const slugifiedSpace = slugify(space);

        const url = window.location.href;

        const index = baseSpace ? url.indexOf(baseSpace) : url.length;
        const remLocation = url.slice(index);
        const location = (
            (remLocation ? remLocation + '/' : '') + slugifiedSpace
        ).replace(/\/$/, '');

        const uuid = !personal ? window.crypto.randomUUID() : '';
        const encUUID = uuid ? await encryptStr(uuid, algorithm, key) : '';

        socket.emit(
            'create_space',
            {
                name: space,
                location,
                userId,
                parentLoc: remLocation,
                personal,
                pass: encUUID,
                baseSpace,
            },
            async ({ newSpaceId }: { newSpaceId: string }) => {
                console.log(newSpaceId);
            }
        );
    };

    return (
        <>
            <form onSubmit={(event) => event.preventDefault()}>
                <input
                    type="text"
                    name="space"
                    className="textbox"
                    onChange={onSpaceChange}
                    placeholder={space}
                />
                <input
                    type="checkbox"
                    name="personal"
                    className="checkbox"
                    onChange={(event) => setPersonal(event.target.checked)}
                    checked={personal}
                />
                <label htmlFor="personal">Personal</label>
                <br></br>
                <button type="submit" className="button" onClick={createSpace}>
                    Create
                </button>
            </form>
        </>
    );
};

export default NewSpace;
