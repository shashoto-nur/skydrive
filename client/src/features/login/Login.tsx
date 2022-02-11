import React, { useState, useEffect } from 'react';
import { Socket } from "socket.io-client";

import { useAppSelector } from '../../app/hooks';
import styles from './Login.module.css';
import { selectApp } from '../../AppReducer';

const Login = () => {
    const socket = useAppSelector(selectApp) as Socket;
    useEffect(() => {
        if(socket) {
            socket.on("LOGIN_RESPONSE", ({ res }) => {
                console.log("Login response: ", { res });
                const token = res.token;
                localStorage.setItem('token', token);
            });
        }
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

    const loginUser = () => {
        if (email !== 'Enter your email' && password !== 'Enter your password')
            socket.emit('login', { email, password });
        else alert('Please enter an email!');
    };

    return (
        <>
            <form onSubmit={ event => event.preventDefault() }>
                <input type="text" name="email" className={styles.textbox}
                    onChange={ onMailChange } placeholder={ email } />
                <input type="text" name="password" className={styles.textbox}
                    onChange={ onPasswordChange } placeholder={ password } />
                <button type="submit" className={styles.button}
                    onClick={ loginUser }>Login</button>
            </form>
        </>
    );
}

export default Login;