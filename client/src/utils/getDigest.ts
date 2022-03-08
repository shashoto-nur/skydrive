import { encryptStr } from "./cryptoString";

const getDigest = async ({
    id,
    algorithm,
    key,
}: {
    id: string;
    algorithm: {
        name: string;
        iv: Uint8Array;
    };
    key: CryptoKey;
}) => {
    const text = await encryptStr(id, algorithm, key);
    const data = new TextEncoder().encode(text);
    const digestBuffer = await crypto.subtle.digest("SHA-256", data);

    const digestArray = new Uint8Array(digestBuffer);
    const base64Digest = btoa(String.fromCharCode(...digestArray));

    return base64Digest;
};

export default getDigest;