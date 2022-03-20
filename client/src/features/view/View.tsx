import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Link, useParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSocket, selectSpaces } from '../../main/AppSlice';
import { selectKey, selectAlgorithm } from '../login/loginSlice';
import { IFile, setGlobalIncompleteFiles, setSpaceInView } from './viewSlice';

import decryptFile from '../../helpers/decryptFile';
import { deriveKey, getAlgorithm, getDigest } from '../../utils';
import variables from '../../env';
import { NewSpace, Recover } from '../';
import { IPopulatedSpace, ISpace } from '../spaces/spacesSlice';
import Upload from '../upload/Upload';

const Space = () => {
    const { baseSpace } = useParams();
    const dispatch = useAppDispatch();

    const socket = useAppSelector(selectSocket) as Socket;
    const spaces = useAppSelector(selectSpaces);
    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);

    const [files, setFiles] = useState<IFile[] | ''>('');
    const [partialDown, setPartialDown] = useState<'' | File>('');
    const [subspaces, setSubSpaces] = useState<ISpace[] | ''>('');
    const [spaceObj, setSpaceObj] = useState<IPopulatedSpace | ''>('');

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

    const url = window.location.href;
    useEffect(() => {
        if (!socket || !baseSpace) return;

        const space = spaces.find((s) => s.location === baseSpace);
        if (!space) return console.log('Space not found');

        const index = url.indexOf(baseSpace);
        const remLocation = url
            .slice(index + baseSpace.length + 1)
            .replace(/\/$/, '');

        socket.emit(
            'get_space',
            {
                location: baseSpace + (remLocation ? '/' + remLocation : ''),
                id: remLocation ? space._id : undefined,
            },
            ({ space, err }: { space: IPopulatedSpace; err: string }) => {
                if (err) return console.log(err);
                console.log(space)
                const allFiles = space.entities.files;
                const [completeFiles, incompleteFiles] = partition(
                    allFiles,
                    (file: IFile) => file.chunks.length === file.chunkNum
                );

                dispatch(setGlobalIncompleteFiles(incompleteFiles));
                dispatch(setSpaceInView(space));
                setSpaceObj(space);
                setFiles(completeFiles);
                setSubSpaces(space.entities.subspaces);
            }
        );
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, socket, spaces]);
    if (!socket || !key || !algorithm) return <></>;

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
            <h2>{spaceObj ? spaceObj.name : "Loading"}</h2>

            {subspaces && subspaces.length > 0 && (
                <>
                    <h4>Subspaces</h4>
                    <ul>
                        {subspaces.map(({ name, location }) => (
                            <li key={location}>
                                <Link to={`/view/${location}`}>{name}</Link>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <Upload />

            {files && files.length > 0 ? (
                files.map((file, index) => (
                    <div key={index}>
                        <h4>{file.name}</h4>
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
                <h4>No files</h4>
            )}

            <Recover />
            <NewSpace />
        </>
    );
};

export default Space;
