const getAllIndexes = (arr: [[number]], val: any) => {
    var indexes = [],
        i = -1;
    while ((i = arr.indexOf(val, i + 1)) !== -1) {
        indexes.push(i);
    }
    return indexes;
};

export default getAllIndexes;
