import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import { useAppSelector } from '../../app/hooks';
import { selectSocket, selectSpaces } from '../../main/AppSlice';
import { selectAlgorithm, selectKey } from '../login/loginSlice';

import { encryptStr, slugify } from '../../utils';

const NewSpace = () => {
    const { baseSpace } = useParams();
    const selectedSocket = useAppSelector(selectSocket);

    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);
    const spaces = useAppSelector(selectSpaces);

    const [space, setSpace] = useState('New space');

    if (!selectedSocket || !key || !algorithm) return <>Eh...</>;
    const socket = selectedSocket as Socket;

    const onSpaceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSpace(event.target.value);
    };

    const createSpace = () => {
        if (space === 'New space') return alert('Enter a name for your space!');
        const slugifiedSpace = slugify(space);

        const url = window.location.href;

        const index = baseSpace ? url.indexOf(baseSpace) : url.length;
        const remLocation = url.slice(index);
        const location = (
            (remLocation ? remLocation + '/' : '') + slugifiedSpace
        ).replace(/\/$/, '');

        const baseObj = spaces.find((s) => s.location === baseSpace);

        socket.emit(
            'create_space',
            {
                name: space,
                location,
                baseSpace: baseObj?._id,
                parentLoc: remLocation,
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
                <button type="submit" className="button" onClick={createSpace}>
                    Create
                </button>
            </form>
        </>
    );
};

export default NewSpace;
