import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { useParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSocket, selectSpaces } from '../../main/AppSlice';
import { selectKey, selectAlgorithm } from '../login/loginSlice';
import { IFile, setGlobalIncompleteFiles } from './viewSlice';

import decryptFile from '../../helpers/decryptFile';
import { deriveKey, getAlgorithm, getDigest } from '../../utils';
import variables from '../../env';
import { NewSpace, Recover } from '../';
import { IPopulatedSpace, ISpace } from '../spaces/spacesSlice';

const Space = () => {
    const { location } = useParams();
    const dispatch = useAppDispatch();

    const socket = useAppSelector(selectSocket) as Socket;
    const spaces = useAppSelector(selectSpaces);
    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);

    const [files, setFiles] = useState<IFile[] | ''>('');
    const [partialDown, setPartialDown] = useState<'' | File>('');
    const [subspaces, setSubSpaces] = useState<ISpace[] | ''>('');

    const selectPartialDown = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event?.target?.files![0]) {
            setPartialDown(event.target.files![0]);
        }
    };

    function partition(
        array: IFile[],
        isComplete: { (file: IFile): boolean; (arg0: IFile): any }
    ) {
        let com: IFile[] = [];
        let incom: IFile[] = [];
        return array.reduce(
            ([com, incom], elem) => {
                if (isComplete(elem)) com.push(elem);
                else incom.push(elem);

                return [com, incom];
            },
            [com, incom]
        );
    }

    if(!location) return <div>Invalid Path</div>;
    const baseSpace = location.slice(0, location.indexOf('/'));
    const space = spaces.find((s) => s.name === baseSpace);
    if (!socket || !key || !algorithm || !space) return <></>;

    if (!files) {
        socket.emit(
            'get_space',
            { location, id: space._id },
            ({ space, err }: { space: IPopulatedSpace; err: string }) => {
                if (err) return console.log(err);
                const allFiles = space.entities.files;
                const [incompleteFiles, completeFiles] = partition(
                    allFiles,
                    (file: IFile) => file.chunks.length === file.chunkNum
                );

                dispatch(setGlobalIncompleteFiles(incompleteFiles));
                setFiles(completeFiles);
                setSubSpaces(space.entities.subspaces);
            }
        );
    }

    const createLink = ({ id }: { id: string }) => {
        return async () => {
            const digest = await getDigest({ id, algorithm, key });
            const source = { id, digest };

            const link = btoa(JSON.stringify(source));
            const base = window.location.origin + '/file/';
            await navigator.clipboard.writeText(base + link);

            alert('Link copied to clipboard!');
        };
    };

    const download = (name: string, chunks: [[number]], id: string) => {
        return async () => {
            const digest = await getDigest({ id, algorithm, key });

            const fileKey = await deriveKey(digest);
            const fileAlgo = getAlgorithm(digest);
            if (!fileKey || !fileAlgo) return alert('Try again');

            const startFrom = partialDown
                ? partialDown.size / variables.CHUNK_SIZE
                : 0;

            decryptFile({
                chunks,
                socket,
                name,
                key: fileKey,
                algorithm: fileAlgo,
                startFrom,
                partialDown,
            });
        };
    };

    return (
        <>
            <h2>{location}</h2>

            {subspaces && subspaces.length > 0 && (
                <>
                    <h3>Subspaces</h3>
                    <ul>
                        {subspaces.map(({ location }) => (
                            <li key={location}>
                                <a href={`/space/${location}`}>{location}</a>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {files ? (
                files.map((file, index) => (
                    <div key={index}>
                        <h3>{file.name}</h3>
                        <p>Size: {Math.ceil(file.size / (1024 * 1024))} mb</p>

                        <input type="file" onChange={selectPartialDown} />
                        <button onClick={createLink({ id: file._id })}>
                            Get Link
                        </button>
                        <button
                            onClick={download(file.name, file.chunks, file._id)}
                        >
                            Download
                        </button>
                    </div>
                ))
            ) : (
                <h3>No files</h3>
            )}

            <Recover />
            <NewSpace />
        </>
    );
};

export default Space;
