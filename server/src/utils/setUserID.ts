import jwt from "jsonwebtoken";

const setUserID = (socket: any) => {
    const { token } = socket.handshake.auth;
    if (!token) socket.send({ res: "No token provided" });
    else {
        jwt.verify(
            token,
            process.env.SECRET_KEY!,
            (err: any, decodedToken: any) => {
                if (err) socket.send({ res: "Invalid token" });
                else {
                    const { id } = decodedToken;
                    socket.handshake.auth.userId = id;
                };
            }
        );
    };
};
export default setUserID;