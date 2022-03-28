import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAppSelector } from '../../app/hooks';
import { selectSocket, selectSpaces } from '../../main/AppSlice';

import { selectAlgorithm, selectKey } from '../login/loginSlice';
import { ISpace } from './spacesSlice';
import NewSpace from '../newspace/NewSpace';

const Spaces = () => {
    const selectedSocket = useAppSelector(selectSocket);

    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);

    const [spaceObjects, setSpaceObjects] = useState<ISpace[] | ''>('');
    const spacesSelected = useAppSelector(selectSpaces);

    useEffect(() => {
        setSpaceObjects(spacesSelected);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spacesSelected]);

    if (!selectedSocket || !key || !algorithm) return <>Error</>;

    return (
        <>
            <div className="spaces">
                <div className="spaces_header">
                    <h1>Spaces</h1>
                    {spaceObjects ? (
                        spaceObjects.map((spaceObj, index) => (
                            <div key={index} className="space">
                                <Link to={'../view/' + spaceObj.location}>
                                    <h2>{spaceObj.name}</h2>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <h2>No spaces</h2>
                    )}
                </div>
            </div>

            <NewSpace />
        </>
    );
};

export default Spaces;
