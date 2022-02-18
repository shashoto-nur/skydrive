
import React, { useState } from 'react';

import encryptFile from '../../helpers/encryptFile';
import { useAppSelector } from '../../app/hooks';
import { selectKey, selectAlgorithm } from '../login/loginSlice';


const Upload = () => {
    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm) as { name: string; iv: Uint8Array; };

    const [file, setFile] = useState<"" | File>('');
    const [filename, setFilename] = useState('Choose A File');

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event?.target?.files![0]) {
            setFile(event.target.files![0]);
            setFilename(event.target.files![0].name);
        };
    };

    const clickFileInput = (event: React.KeyboardEvent<HTMLLabelElement>) => {
        if(event.key === ' ' || event.key === 'Enter') document.getElementById('file')?.click();
    };

    const encrypt = () => {
        if(!file || !key) alert('Please provide a file and a passkey in order to encrypt!');
        else encryptFile({ file, filename, key, algorithm });
    };

    return (
        <>
            <h1> File upload </h1>

            <div className="division"><hr /></div>
            <br /><br /><br />

            <div className="main">
                <form onSubmit={ event => event.preventDefault() }>
                    <div>
                        <label htmlFor="file" id="file-label" tabIndex={ 0 } onKeyPress={ clickFileInput } >
                            {
                                file === ''
                                    ? 'Choose a File'
                                    : `${ filename.substring(0, 30) }${ filename.length > 30 ? '...' : '' }`
                            }
                            <input type='file' id="file" name="file" onChange={ onFileChange } />
                        </label>
                        <br /><br /><br />
                    </div>

                    <input type='button' value='Upload' onClick={ encrypt } />
                </form>
            </div>
        </>
    );

};

export default Upload;