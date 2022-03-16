# SkyDrive

## Nested spaces

    Create Subspace functionality in space
    Slugify name to create location
    Rename space to view
    Locations: view/:destination

## Shared space

    encData = encrypt(digest, data)
    encDigest = EPK(pub, digest)
    send(encData, encDigest)

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
