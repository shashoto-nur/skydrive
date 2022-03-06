import React, { useState } from 'react';
import { Socket } from "socket.io-client";

import { useAppSelector } from '../../app/hooks';
import { selectSocket } from '../../main/AppSlice';

const Signup = () => {
    const socket = useAppSelector(selectSocket) as Socket;

    const [email, setEmail] = useState('Enter your email');
    const onMailChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setEmail(event.target.value);
    };

    const sendEmail = () => {
        if (email !== 'Enter your email')
            socket.emit('signup', { email }, ({ res }: { res:string }) => {
                console.log("Password update response: ", { res });
            });
        else alert('Please enter an email!');
    };

    return (
        <>
            <form onSubmit={ event => event.preventDefault() }>
                <input type="text" name="email" className="textbox"
                    onChange={ onMailChange } placeholder={ email } />
                <button type="submit" className="button"
                    onClick={ sendEmail }>Send</button>
            </form>
        </>
    );
}

export default Signup;