import { useState } from 'react';
import { Socket } from 'socket.io-client';

import { useAppSelector } from '../../app/hooks';
import { selectSocket } from '../../main/AppSlice';
import { selectKey, selectAlgorithm } from '../login/loginSlice';

import { deriveKey, getAlgorithm, getDigest } from '../../utils';
import encryptFile from '../../helpers/encryptFile';
import { selectIncomFiles } from '../view/viewSlice';

const Space = () => {
    const socket = useAppSelector(selectSocket) as Socket;
    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);

    const incompleteFiles = useAppSelector(selectIncomFiles);

    const [recoveringId, setRecoveringId] = useState<string>('');
    const [missing, setMissing] = useState<number>(-1);
    const [reFile, setReFile] = useState<'' | File>('');
    const [reFilename, setReFilename] = useState('Choose A File');

    const selectRecoveryFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event?.target?.files![0]) {
            setReFile(event.target.files![0]);
            setReFilename(event.target.files![0].name);
        }
    };

    if (!socket || !key || !algorithm) return <></>;
    const selectRecoveringId = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedIndex = event.target.options.selectedIndex;
        const selectElement = event.target.options[selectedIndex];

        const chunkArr = JSON.parse(selectElement.id);
        const missingIndex = chunkArr.indexOf(undefined);

        setMissing(missingIndex);
        setRecoveringId(event.target.value);
    };

    const recover = async () => {
        const id = recoveringId;
        if (!reFile || !key || !algorithm)
            return alert(
                'Please provide a file and a passkey in order to encrypt!'
            );

        const digest = await getDigest({ id, algorithm, key });
        const fileKey = await deriveKey(digest);
        const fileAlgo = getAlgorithm(digest);
        if (!fileKey || !fileAlgo) return alert('Try again');
        if (!id) return alert('Please select a file to recover');
        if (missing === -1) return alert('Please select a file to recover');

        await encryptFile({
            id,
            file: reFile,
            filename: reFilename,
            key: fileKey,
            algorithm: fileAlgo,
            socket,
            startFrom: missing,
        });
    };

    return (
        <>
            {incompleteFiles && (
                <>
                    <h6>Incomplete files</h6>

                    <form onSubmit={(event) => event.preventDefault()}>
                        {reFile === ''
                            ? 'Choose a File'
                            : `${reFilename.substring(0, 30)}${
                                  reFilename.length > 30 ? '...' : ''
                              }`}
                        <input
                            type="file"
                            id="file"
                            name="file"
                            onChange={selectRecoveryFile}
                        />

                        <select onChange={selectRecoveringId}>
                            {incompleteFiles.map(({ _id, name, chunks }) => (
                                <option
                                    id={JSON.stringify(chunks)}
                                    key={_id}
                                    value={_id}
                                >
                                    {name}
                                </option>
                            ))}
                        </select>

                        <input type="button" value="Upload" onClick={recover} />
                    </form>
                </>
            )}
        </>
    );
};

export default Space;
