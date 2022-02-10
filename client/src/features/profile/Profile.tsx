import React, { useState, useEffect } from 'react';
import { Socket } from "socket.io-client";

import { useAppSelector } from '../../app/hooks';
import styles from './Profile.module.css';
import { selectApp } from '../../AppReducer';
import { Link } from 'react-router-dom';

const Profile = () => {
    const socket = useAppSelector(selectApp) as Socket;

    useEffect(() => {
        if(socket) {
            socket.on("UPDATE_PASSWORD_RESPONSE", ({ res }) => {
                console.log("Password update response: ", { res });
            });
        }
    }, [socket]);

    const [password, setPassword] = useState('New password');
    const onPasswordChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setPassword(event.target.value);
    };

    const updatePassword = () => {
        if (password !== 'New password')
            socket.emit('update_password', { password });
        else alert('Please enter an email!');
    };

    return (
        <>
            <form onSubmit={ event => event.preventDefault() }>
                <input type="text" name="password" className={styles.textbox}
                    onChange={ onPasswordChange } placeholder={ password } />
                <button type="submit" className={styles.button}
                    onClick={ updatePassword }>Update</button>
            </form>
            <Link to="/">SignUp</Link>
            <Link to="/login">Login</Link>
        </>
    );
}

export default Profile;