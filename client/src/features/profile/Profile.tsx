import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

import { useAppSelector } from '../../app/hooks';
import { selectSocket } from '../../main/AppSlice';
import { encryptStr, genKeyPair } from '../../utils';
import { selectKey, selectAlgorithm } from '../login/loginSlice';

const Profile = () => {
    const socket = useAppSelector(selectSocket) as Socket;
    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);

    const [password, setPassword] = useState('New password');

    useEffect(() => {
        if (!socket || !key || !algorithm) return;
        socket.emit(
            'has_key_pairs',
            async ({ exists, err }: { exists: boolean; err: string }) => {
                if (err) return console.log(err);
                if (exists) return;

                const { publicKeyJwk, privateKeyJwk } = await genKeyPair();
                const privateKeyString = btoa(JSON.stringify(privateKeyJwk));

                const encPrivateKey = await encryptStr(
                    privateKeyString,
                    algorithm,
                    key
                );
                socket.emit(
                    'store_key_pairs',
                    { pub: publicKeyJwk, priv: encPrivateKey },
                    ({ err }: { err: string | undefined }) => {
                        if (err) console.log(err);
                    }
                );
            }
        );
    }, [algorithm, key, socket]);

    const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const updatePassword = () => {
        if (password !== 'New password')
            socket.emit(
                'update_password',
                { password },
                ({ res }: { res: string }) => {
                    console.log('Password update response: ', { res });
                }
            );
        else alert('Please enter an email!');
    };

    return (
        <>
            <form onSubmit={(event) => event.preventDefault()}>
                <input
                    type="text"
                    name="password"
                    className="textbox"
                    onChange={onPasswordChange}
                    placeholder={password}
                />
                <button
                    type="submit"
                    className="button"
                    onClick={updatePassword}
                >
                    Update
                </button>
            </form>
        </>
    );
};

export default Profile;
