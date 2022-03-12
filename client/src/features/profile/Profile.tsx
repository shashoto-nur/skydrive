import React, { useState } from 'react';
import { Socket } from 'socket.io-client';

import { useAppSelector } from '../../app/hooks';
import { selectSocket } from '../../main/AppSlice';

const Profile = () => {
    const socket = useAppSelector(selectSocket) as Socket;

    const [password, setPassword] = useState('New password');
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
