import variables from '../env';

const getAlgorithm = (passkey: string) => {
    try {
        const repetitons = Math.floor(variables.IV_SIZE / passkey.length);
        const stringVector = (
            repetitons === 0 ? passkey : passkey.repeat(repetitons + 1)
        ).substring(0, variables.IV_SIZE);

        const bitVector = new TextEncoder().encode(stringVector);
        const algorithm = { name: variables.ALGO, iv: bitVector };

        return algorithm;
    } catch (err) {
        console.log(err);
    }
};

export default getAlgorithm;
