const encryptStr = async (
    string: string,
    algorithm: { name: string; iv: Uint8Array },
    key: CryptoKey
) => {
    const uint8Arr = new TextEncoder().encode(string);

    const encBuffer = await window.crypto.subtle.encrypt(
        algorithm,
        key,
        uint8Arr
    );
    const encUint8Arr: any = new Uint8Array(encBuffer);

    const encString = String.fromCharCode.apply(null, encUint8Arr);
    const encBase64String = btoa(encString);

    return encBase64String;
};

const decryptStr = async (
    encBase64String: string,
    algorithm: { name: string; iv: Uint8Array },
    key: CryptoKey
) => {
    const string: any = atob(encBase64String);
    const encUint8Arr = new Uint8Array(
        [...string].map((char) => char.charCodeAt(0))
    );

    const decBuffer = await window.crypto.subtle.decrypt(
        algorithm,
        key,
        encUint8Arr
    );

    const decUint8Arr = new Uint8Array(decBuffer);
    const decString = new TextDecoder().decode(decUint8Arr);

    return decString;
};

export { encryptStr, decryptStr };
