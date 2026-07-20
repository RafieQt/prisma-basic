import bcrypt from "bcryptjs";
import { NextFunction, Request, Response, Router } from "express";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import { userController } from "./user.contoller";
import { jwtUtils } from "../../utils/jwt";
import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";

const router = Router();

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

router.post("/register", userController.createUser);

const auth = (...requiredRole: Role[])=>{
    return catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies.accessToken 
        //   ||
        //   req.headers.authorization?.startsWith("brearer ")
        //     ? req.headers.authorization?.split(" ")[1]
        //     : req.headers.authorization;

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

router.get(
  "/me",
//   (req: Request, res: Response, next: NextFunction) => {
//     const { accessToken } = req.cookies;
//     console.log(accessToken);

//     const verifiedToken = jwtUtils.verifiedToken(
//       accessToken,
//       config.jwt_access_secret,
//     );

//     if (!verifiedToken.success) {
//       throw new Error(verifiedToken.error);
//     }

//     const { email, id, role, name } = verifiedToken.data as JwtPayload;

//     const requiredRole = [Role.ADMIN, Role.USER, Role.AUTHOR];

//     if (!requiredRole.includes(role)) {
//       return res.status(403).json({
//         success: false,
//         statusCode: httpStatus.FORBIDDEN,
//         message: "Forbidden entry!",
//       });
//     }

//     req.user = {
//       name,
//       email,
//       role,
//       id,
//     };

//     next();
//   },
  auth(Role.ADMIN, Role.USER, Role.AUTHOR),
  userController.getMyProfile,
);

export const userRoutes = router;
