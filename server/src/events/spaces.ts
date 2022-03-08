import { createSpace, getSpaces } from "../controllers/spaces/";
import { createFileObject, getFile, getFiles } from "../controllers/files/";
import { ISpace } from "../models/Space";
import { IFile } from "../models/File";

const setSpacesEvents = (socket: any) => {
    socket.on(
        "create_space",
        async (
            { space }: { space: string },
            callback: (arg0: { spaceIds?: any; res?: string }) => void
        ) => {
            if (socket.handshake.auth.userId) {
                const newSpaceIds = await createSpace(space);

                socket.handshake.auth.spaceIds = socket.handshake.auth.spaceIds
                    ? [...socket.handshake.auth.spaceIds, newSpaceIds].filter(
                          (el) => el !== ""
                      )
                    : [newSpaceIds];
                callback({ spaceIds: socket.handshake.auth.spaceIds });
            } else callback({ res: "Unauthorized" });
        }
    );

    socket.on(
        "get_spaces",
        async (
            ids: string[],
            callback: (arg0: { res: string | ISpace[] }) => void
        ) => {
            if (socket.handshake.auth.userId) {
                socket.handshake.auth.spaceIds = ids;
                const res = await getSpaces(ids);
                callback({ res });
            } else callback({ res: "Unauthorized" });
        }
    );

    socket.on(
        "upload_file",
        async (
            fileData: { name: string; size: number; space: string },
            callback: (arg0: { id: any }) => void
        ) => {
            const id: string = await createFileObject(fileData);
            callback({ id });
        }
    );

    socket.on(
        "get_files",
        async (
            fileIds: string[],
            callback: (arg0: { files: IFile[] }) => void
        ) => {
            const files = await getFiles(fileIds);
            callback({ files });
        }
    );

    socket.on(
        "get_file",
        async (
            fileId: string,
            callback: (arg0: { file: IFile | string }) => void
        ) => {
            const file = await getFile(fileId);
            callback({ file });
        }
    );
};

export default setSpacesEvents;
