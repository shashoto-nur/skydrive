# SkyDrive

## Initialize

    Secure an websocket connection
    Initiate a mail server
    Connect to a database
    Setup a cron job for removing unverified mails (24 hrs)
    Establish a storage client
    Add global state manager to client

## User profile

    SignUp [create User object]
    Store email & generated hashed otp into database
    Switch to socket.io
    Initiate login (email, update password)
    Add Space (encrypt id & modify user)
    Setup Pin lock (local & global)
    Set cookies (auth, encryption)
    Logout (rm cookies & pin)
    Profile modification (avatar, password reset, delete user)

## Upload File

    Create database file object
    Generate cryptokey from hashed (password & file_id)
    Split, Encrypt, Send & Store chunk
    Create chunk object
    Update Space

## Download File

    Generate cryptokey from hashed (password & file_id)
    Send download req with file_id
    Retrieve, Decrypt & Write file

## Quick Access

    Generate base_128 hashed value (password & file_id)
    Retrieve file with base_128 hash

## Drop Recovery

    Monitor chunk counts
    Pause (on network failure)
    Verify & Resume exchanges
    Chunk combiner

## File System

    Update database file & Space
    Delete telegram file
    Query files in database
    Change system view, file sortion

## Completion

    Installable web app
    Tutorials & Docs

### Models

    User (email, password, verified, space, pin, profile)
    Space (id, name, preferences, bookmarks)
        File (id, name, description, created, location, chunks, type)
            Chunks (id, file_id, position)
