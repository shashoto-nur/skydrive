import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import { useAppSelector } from '../../app/hooks';
import { selectSocket, selectSpaces } from '../../main/AppSlice';
import { selectAlgorithm, selectKey } from '../login/loginSlice';

import { deriveKey, encryptStr, getAlgorithm, slugify } from '../../utils';

const NewSpace = () => {
    const { baseSpace } = useParams();
    const selectedSocket = useAppSelector(selectSocket);

    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);
    const spaces = useAppSelector(selectSpaces);

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

        const baseObj = spaces.find((s) => s.location === baseSpace);

        let spaceKey: CryptoKey | undefined,
            spaceAlgo:
                | {
                      name: string;
                      iv: Uint8Array;
                  }
                | undefined;

        if (!personal) {
            const uuid = window.crypto.randomUUID();
            spaceKey = await deriveKey(uuid);
            spaceAlgo = getAlgorithm(uuid);
            if (!spaceKey || !spaceAlgo) return alert('Error creating key');
        }

        socket.emit(
            'create_space',
            {
                name: space,
                location,
                baseSpace: baseObj?._id,
                parentLoc: remLocation,
                personal,
                key: spaceKey,
                algo: spaceAlgo,
            },
            async ({
                spaceIds,
                isBaseSpace,
            }: {
                spaceIds: string[];
                isBaseSpace: boolean;
            }) => {
                if (!isBaseSpace) return;
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
