import React, { useEffect, useState } from 'react';
import { Socket } from "socket.io-client";
import { useParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSocket } from '../../AppSlice';

import styles from './Space.module.css';

const Space = () => {
    const socket = useAppSelector(selectSocket) as Socket;
    const dispatch = useAppDispatch();
    const params = useParams();

    useEffect(() => {
      if (!socket) return;
      socket.emit("get_files", params.name, ({ res }: { res: string }) => {
        dispatch({ type: "SET_FILES", payload: res });
      });
    }, [socket, params.name, dispatch]);

    return (
        <>
            {params.name}
        </>
    );
}

export default Space;