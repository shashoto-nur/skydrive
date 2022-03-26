import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Link, useParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectShareds, selectSocket } from '../../main/AppSlice';
import { selectKey, selectAlgorithm } from '../login/loginSlice';
import { IFile, setGlobalIncompleteFiles, setSpaceInView } from './viewSlice';

import decryptFile from '../../helpers/decryptFile';
import {
    deriveComKey,
    deriveKey,
    encryptStr,
    getAlgorithm,
    getDigest,
} from '../../utils';
import variables from '../../env';
import { NewSpace, Recover } from '../';
import { IPopulatedSpace, ISpace } from '../spaces/spacesSlice';
import Upload from '../upload/Upload';

const Space = () => {
    const { baseSpace } = useParams();
    const dispatch = useAppDispatch();

    const socket = useAppSelector(selectSocket) as Socket;
    const shareds = useAppSelector(selectShareds);

    const [files, setFiles] = useState<IFile[] | ''>('');
    const [partialDown, setPartialDown] = useState<'' | File>('');

    const [subspaces, setSubSpaces] = useState<ISpace[] | ''>('');
    const [spaceObj, setSpaceObj] = useState<IPopulatedSpace | ''>('');
    const [invitedUser, setInvitedUser] = useState<string | ''>('');

    const [key, setKey] = useState<CryptoKey | null>(useAppSelector(selectKey));
    const [algorithm, setAlgorithm] = useState(useAppSelector(selectAlgorithm));
    const [pass, setPass] = useState<string | ''>('');

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

        const index = url.indexOf(baseSpace);
        const location = url.slice(index).replace(/\/$/, '');

        if (spaceObj) return;
        socket.emit(
            'get_space',
            {
                location,
            },
            async ({ space, err }: { space: IPopulatedSpace; err: string }) => {
                if (err) return console.log(err);

                const allFiles = space.entities.files;
                const [completeFiles, incompleteFiles] = partition(
                    allFiles,
                    (file: IFile) => file.chunks.length === file.chunkNum
                );

                dispatch(setGlobalIncompleteFiles(incompleteFiles));
                dispatch(setSpaceInView(space));

                if (!space.personal) {
                    const shared = shareds.find(
                        (decShared) => decShared.space._id === space._id
                    );
                    if (!shared) return;

                    const { pass } = shared;
                    const tempKey = await deriveKey(pass);
                    const tempAlgo = getAlgorithm(pass);

                    if (!tempKey || !tempAlgo) return;

                    setKey(tempKey);
                    setAlgorithm(tempAlgo);
                    setPass(pass);
                }

                setSpaceObj(space);
                setFiles(completeFiles);
                setSubSpaces(space.entities.subspaces);
            }
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, socket]);
    if (!socket || !key || !algorithm) return <></>;

    const createLink = ({ id }: { id: string }) => {
        return async () => {
            if (!key || !algorithm) return;
            const digest = await getDigest({ id, algorithm, key });
            const source = { id, digest };

            const link = btoa(JSON.stringify(source));
            const base = window.location.origin + '/file/';
            await navigator.clipboard.writeText(base + link);

            console.log('Link copied to clipboard!');
        };
    };

    const download = (name: string, chunks: [[number]], id: string) => {
        return async () => {
            if (!key || !algorithm) return;
            const digest = await getDigest({ id, algorithm, key });

            const fileKey = await deriveKey(digest);
            const fileAlgo = getAlgorithm(digest);
            if (!fileKey || !fileAlgo) return console.log('Try again');

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

    const onUserChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInvitedUser(event.target.value);
    };

    const inviteUser = () => {
        if (!invitedUser) return console.log('Enter a user');
        if (!spaceObj) return console.log('Space not found');

        socket.emit(
            'get_keys',
            { otheruser: invitedUser },
            async ({ pub, priv }: { pub: JsonWebKey; priv: string }) => {
                if (!pub || !priv) return console.log('No keys found');

                const privJwk: JsonWebKey = JSON.parse(atob(priv));
                const comKey = await deriveComKey(pub, privJwk);
                const comAlgo = getAlgorithm(JSON.stringify(comKey));
                if (!comKey || !comAlgo)
                    return console.log('No keys or algo found');

                if (!pass) return console.log("Shared space's pass not found");
                const encPass = await encryptStr(pass, comAlgo, comKey);

                socket.emit(
                    'invite_user',
                    {
                        spaceId: spaceObj._id,
                        otheruser: invitedUser,
                        encPass,
                    },
                    ({ err }: { err: string }) => {
                        if (err) console.log(err);
                    }
                );
            }
        );
    };

    return (
        <>
            <h2>{spaceObj ? spaceObj.name : 'Loading'}</h2>
            <p>Type: {spaceObj && spaceObj.personal ? 'Personal' : 'Shared'}</p>
            {spaceObj && spaceObj.personal && (
                <>
                    <input
                        type="text"
                        name="space"
                        className="textbox"
                        onChange={onUserChange}
                        placeholder={invitedUser}
                    />
                    <button onClick={inviteUser}>Invite</button>
                </>
            )}

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
