# SkyDrive

## Shared space

    Generate a random key
    Encrypt the key against the user's password
    Store the encrypted key in database
    Get the added user's public key
    Encrypt the key with the public key
    Share the encrypted key with the added user

    On connection, check for add request
    Accept || (Reject ?& Block)
        Get the encrypted key
        Decrypt the key with the user's private key
        Encrypt the key against the user's password
        Store the encrypted key in database
    encData = encrypt(digest, data)
    encDigest = EPK(pub, digest)
    send(encData, encDigest)

## Files viewer

## Automated Encryption Update

    List all files in storage
    For each file:
        For each chunk:
            Get chunk
            Decrypt chunk
            Re-encrypt chunk
            Send chunk
            Update database

## External endpoint support

    On message, send chat id
    Receive chat id
    List all files in storage
    For each file:
        For each chunk:
            Forward chunk to chat id
    Create a copy of db data
    Read copy and provide instructions
    Component to input multiple files
        decrypy & save

## File System

    Update database file & Space
    Delete storage file
    Query files in database
    Change system view, file sortion

## Completion

    Seperate sockets
    Change nodemailer auth mechanism
    Exception & error management
    Profile modification (avatar, password reset, delete user)
    Installable web app
    Tutorials & Docs
    UI & UX
