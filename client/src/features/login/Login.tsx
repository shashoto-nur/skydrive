import React, { useState, useEffect } from 'react';
import { Socket } from "socket.io-client";

import { useAppSelector } from '../../app/hooks';
import styles from './Login.module.css';
import { selectApp } from '../../AppReducer';

const Login = () => {
    const socket = useAppSelector(selectApp) as Socket;
    useEffect(() => {
        if(!socket) return;
        socket.on("LOGIN_RESPONSE", ({ res }) => {
            console.log("Login response: ", { res });
            const token = res.token;
            localStorage.setItem('token', token);
        });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    const [email, setEmail] = useState('Enter your email');
    const [password, setPassword] = useState('Enter your password');

    const onMailChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setEmail(event.target.value);
    };
    const onPasswordChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setPassword(event.target.value);
    };

    const loginUser = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (email !== 'Enter your email' && password !== 'Enter your password') {
            socket.emit('login', { email, password });
            localStorage.setItem('passkey', password);
        } else alert('Enter your email and password!');
    };

    return (
        <>
            <form onSubmit={ loginUser }>
                <input type="text" name="email" className={styles.textbox}
                    onChange={ onMailChange } placeholder={ email } />
                <input type="text" name="password" className={styles.textbox}
                    onChange={ onPasswordChange } placeholder={ password } />
                <button type="submit" className={styles.button}>Login</button>
            </form>
        </>
    );
}

export default Login;