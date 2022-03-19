import React, { useState } from 'react';
import { Socket } from 'socket.io-client';

import { useAppSelector } from '../../app/hooks';
import { selectSocket } from '../../main/AppSlice';
import { selectAlgorithm, selectKey } from '../login/loginSlice';

import { encryptStr } from '../../utils';

const NewSpace = () => {
    const selectedSocket = useAppSelector(selectSocket);

    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);

    const [space, setSpace] = useState('New space');

    if (!selectedSocket || !key || !algorithm) return <></>;
    const socket = selectedSocket as Socket;

    const onSpaceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSpace(event.target.value);
    };

    const createSpace = () => {
        if (space === 'New space') return alert('Enter a name for your space!');
        const slugifiedSpace = space
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .toLowerCase()
            .replace(/\s/g, '-');
        let location = slugifiedSpace;

        const currentLocation = window.location.href;
        let index: number, baseSpace = '';
        const viewHref = 'view/';

        if (currentLocation.includes(viewHref)) {
            index = currentLocation.indexOf(viewHref);
            const preLocation = currentLocation.slice(index + viewHref.length);
            location = preLocation + slugifiedSpace;
            baseSpace = location.slice(0, location.indexOf('/'));
        }

        socket.emit(
            'create_space',
            { name: space, location, baseSpace },
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
