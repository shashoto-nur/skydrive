import React, { useState } from 'react';
import { Socket } from "socket.io-client";

import { useAppSelector } from '../../app/hooks';
import styles from './Login.module.css';
import { selectApp } from '../../AppReducer';
import { Link } from 'react-router-dom';

const Login = () => {
    const socket = useAppSelector(selectApp) as Socket;
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
            <Link to="/">SignUp</Link>
            <Link to="/profile">Profile</Link>
        </>
    );
}

export default Login;