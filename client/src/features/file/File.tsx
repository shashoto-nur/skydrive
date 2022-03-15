import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import { useAppSelector } from '../../app/hooks';
import { IFile } from '../space/spaceSlice';
import { selectSocket } from '../../main/AppSlice';

import decryptFile from '../../helpers/decryptFile';
import deriveKey from '../../utils/deriveKey';
import getAlgorithm from '../../utils/getAlgorithm';
import variables from '../../env/variables';

const File = () => {
    const { link } = useParams();
    const socket = useAppSelector(selectSocket) as Socket;

    const [fileObj, setFileObj] = useState<IFile | ''>('');
    const [digest, setDigest] = useState<string>('');
    const [partialDown, setPartialDown] = useState<'' | File>('');
    const [partDownName, setPartDownName] = useState(
        'Enter partially downloaded file'
    );

    const selectPartialDown = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event?.target?.files![0]) {
            setPartialDown(event.target.files![0]);
            setPartDownName(event.target.files![0].name);
        }
    };

    useEffect(() => {
        if (!socket) return;
        if (!link) return alert('Invalid file link');
        const { id, digest }: { id: string; digest: string } = JSON.parse(
            atob(link)
        );
        if (!id || !digest) return alert('Invalid file link');
        setDigest(digest);

        socket.emit(
            'get_file',
            id,
            async ({ file }: { file: IFile | string }) => {
                if (typeof file === 'string') return alert('Invalid file link');
                console.log(file);
                setFileObj(file);
            }
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    const download = (name: string, chunks: [[number]], id: string) => {
        return async () => {
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
            {fileObj ? (
                <div>
                    <h2>{fileObj.name}</h2>
                    <p>{fileObj.size}</p>
                    {partDownName}
                    <input type="file" onChange={selectPartialDown} />
                    <button
                        onClick={download(
                            fileObj.name,
                            fileObj.chunks,
                            fileObj._id
                        )}
                    >
                        Download
                    </button>
                </div>
            ) : (
                <>No file</>
            )}
        </>
    );
};

export default File;
