import { JwtPayload, SignOptions } from "jsonwebtoken"
import jwt from "jsonwebtoken"

const createToken = (payload: JwtPayload, secret: string, expiresIn: SignOptions)=>{
    const token = jwt.sign(payload, secret, {expiresIn} as SignOptions);
    return token;
}

const verifiedToken = (token: string, secret: string)=>{
    try {
        const verifiedToken = jwt.verify(token, secret);

        return verifiedToken;
    } catch (error: any) {
        console.log("Token Verification failed: ", error);
        throw new Error(error.message);
    }
}

export const jwtUtils = {
    createToken,
    verifiedToken,
}