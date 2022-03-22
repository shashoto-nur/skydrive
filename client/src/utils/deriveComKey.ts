const deriveComKey = async (
    publicKeyJwk: JsonWebKey,
    privateKeyJwk: JsonWebKey
) => {
    const publicKey = await window.crypto.subtle.importKey(
        'jwk',
        publicKeyJwk,
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        true,
        []
    );

    const privateKey = await window.crypto.subtle.importKey(
        'jwk',
        privateKeyJwk,
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        true,
        ['deriveKey', 'deriveBits']
    );

    const combinedKey = await window.crypto.subtle.deriveKey(
        { name: 'ECDH', public: publicKey },
        privateKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    return combinedKey;
};

export default deriveComKey;
