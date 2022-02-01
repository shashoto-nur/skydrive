# SkyDrive

## Initialize

    Secure an websocket connection
    Initiate a mail server
    Setup a cron job for removing unverified mails (24 hrs)
    Establish a storage client

## User profile

    SignUp [create User object]
    Store email & generated hashed otp into database
    Email verification (create password, rm otp)
    Add Workspace (create ws, encrypt id & modify user)
    Initiate login (email, password)
    Setup Pin lock (local & global)
    Set cookies (auth, encryption)
    Logout (rm cookies & pin)
    Profile modification (avatar, password reset, delete user)

## Upload File

    Create database file object
    Generate cryptokey from hashed (password & file_id)
    Split, Encrypt, Send & Store chunk
    Create chunk object
    Update Workspace

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

    Update database file & Workspace
    Delete telegram file
    Query files in database
    Change system view, file sortion

## Completion

    Installable web app
    Tutorials & Docs

### Models

    User (email, password, otp, ws, pin, avatar)
    Workspace (id, preferences, bookmarks)
    File (id, name, description, created, location, chunks, type)
    Chunks (id, file_id, position)
