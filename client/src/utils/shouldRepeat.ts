import variables from '../env/variables';

const shouldRepeat = (fileSize: number, end: number) => {
    try {
        if (fileSize > end) {
            const newEnd = end + variables.CHUNK_SIZE - variables.PADDING;
            const start = end;
            end = fileSize > newEnd ? newEnd : fileSize;

            return [true, start, end];
        } else return [false, undefined, undefined];
    } catch ({ message }) {
        console.log(message as string);
        return [false, undefined, undefined];
    }
};

export default shouldRepeat;
