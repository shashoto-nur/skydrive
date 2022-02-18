import React, { useState } from 'react';
import { Socket } from "socket.io-client";

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSocket } from '../../AppSlice';

import deriveKey from '../../utils/deriveKey';
import getAlgorithm from '../../utils/getAlgorithm';
import { encryptStr } from '../../utils/cryptoString';

import { setGlobalAlgorithm, setGlobalKey } from './loginSlice';
import styles from './Login.module.css';

const Login = () => {
    const socket = useAppSelector(selectSocket) as Socket;
    const dispatch = useAppDispatch();

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

    const loginUser = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (email !== 'Enter your email' && password !== 'Enter your password') {
            socket.emit('login', { email, password }, ({ res } : { res: {token: string, userId: string} }) => {
                console.log("Login response: ", { res });
                const { token, userId } = res;
                localStorage.setItem('token', token);
                (async () => {
                    const tempKey = await deriveKey(userId) as CryptoKey;
                    const tempAlgorithm = getAlgorithm(userId) as { name: string; iv: Uint8Array; };
        
                    const encPassword = await encryptStr(password, tempAlgorithm, tempKey);
                    localStorage.setItem('encPassword', encPassword);
        
                    const algorithm = getAlgorithm(password) as { name: string; iv: Uint8Array; };
                    const key = await deriveKey(password) as CryptoKey;
        
                    dispatch(setGlobalKey(key));
                    dispatch(setGlobalAlgorithm(algorithm));
                })()
            });

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