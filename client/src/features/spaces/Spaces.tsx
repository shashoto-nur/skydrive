import React, { useEffect, useState } from 'react';
import { Socket } from "socket.io-client";

import { useAppSelector } from '../../app/hooks';
import styles from './Spaces.module.css';
import { selectApp } from '../../AppReducer';
import { Link } from 'react-router-dom';

const Spaces = () => {
    const socket = useAppSelector(selectApp) as Socket;
    const [space, setSpace] = useState('New space');

    const onSpaceChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSpace(event.target.value);
    };

    const createSpace = () => {
        if (space !== 'New space')
            socket.emit('create_space', { space });
        else alert('Name for your space!');
    };

    useEffect(() => {
        if(socket) {
            socket.emit('get_spaces');
            socket.on("GET_SPACE_RESPONSE", ({ res }) => {
                console.log("Get_Space response: ", { res });
            });
            socket.on("CREATE_SPACE_RESPONSE", ({ res }) => {
                console.log("Create_Space response: ", { res });
            });
        }
    }, [socket]);
    

    return (
        <>
            <form onSubmit={ event => event.preventDefault() }>
                <input type="text" name="space" className={styles.textbox}
                    onChange={ onSpaceChange } placeholder={ space } />
                <button type="submit" className={styles.button}
                    onClick={ createSpace }>Create</button>
            </form>
            <Link to="/">SignUp</Link>
            <Link to="/login">Login</Link>
            <Link to="Profile">Profile</Link>
        </>
    );
}

export default Spaces;