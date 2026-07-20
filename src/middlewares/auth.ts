import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import config from "../config";
import { jwtUtils } from "../utils/jwt";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { Role } from "../../generated/prisma/enums";



declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: Role;
      };
    }
  }
}


export const auth = (...requiredRole: Role[])=>{
    return catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies.accessToken ? req.cookies.accessToken :
          req.headers.authorization?.startsWith("brearer ")
            ? req.headers.authorization?.split(" ")[1]
            : req.headers.authorization;

    if (!token) {
      throw new Error("You are not logged in!");
    }

    const verifiedToken = jwtUtils.verifiedToken(
      token,
      config.jwt_access_secret,
    );

    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }
    const {email, id, role, name}= verifiedToken.data as JwtPayload;

    if(requiredRole.length && !requiredRole.includes(role)){
        throw new Error("Forbidden. You don't have permission to access this resource.")
    };

    const user = await prisma.user.findUnique({
        where:{email, id , name, role}
    });

    if(!user){
        throw new Error("User not found!");
    }

    if(user.activeStatus==="BLOCK"){
        throw new Error("Your account is blocked! Please contact support.")
    }

    req.user={
        email, role, id, name
    }
    next();
  }
);
}

