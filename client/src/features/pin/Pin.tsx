import React, { useState, useEffect } from 'react';
import { Socket } from "socket.io-client";

import { useAppSelector } from '../../app/hooks';
import { selectApp } from '../../AppReducer';
import { selectPassword } from '../login/loginSlice';

import deriveKey from '../../utils/deriveKey';
import getAlgorithm from '../../utils/getAlgorithm';
import { encryptStr } from '../../utils/cryptoString';
import styles from './Pin.module.css';

const Login = () => {
    const socket = useAppSelector(selectApp) as Socket;
    const password = useAppSelector(selectPassword);

    useEffect(() => {
        if(!socket) return;
        socket.on("ADD_PIN_RESPONSE", ({ res }) => {
            console.log("Add pin response: ", { res });
        });
    }, [socket]);

    const [isGlobal, setIsGlobal] = useState(false);
    const [pin, setPin] = useState('Enter your password');

    const onPinChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setPin(event.target.value);
    };

    const addPin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (pin !== 'Enter your password') {
            const key = await deriveKey(pin) as CryptoKey;
            const algorithm = getAlgorithm(pin) as { name: string; iv: Uint8Array; };
            const encBase64String = await encryptStr(password, algorithm, key);

            if(isGlobal) socket.emit('add_pin', { pin });
            localStorage.setItem('pin', encBase64String);

        } else alert('Enter a pin or skip!');
    };

    return (
        <>
            <form onSubmit={ addPin }>
                <input type="text" name="pin" className={styles.textbox}
                    onChange={ onPinChange } placeholder={ pin } />
                <label>
                    <input type="checkbox" defaultChecked={isGlobal} 
                        onChange={() => setIsGlobal(!isGlobal)} />
                    Store as global
                </label>
                <button type="submit" className={styles.button}>Set pin</button>
            </form>
        </>
    );
};

export default Login;