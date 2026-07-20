import bcrypt from "bcryptjs";
import { NextFunction, Request, Response, Router } from "express";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import  httpStatus  from "http-status";
import { userController } from "./user.contoller";
import { jwtUtils } from "../../utils/jwt";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

declare global{
    namespace Express{
        interface Request{
            user?:{
                email:string,
                name: string,
                id: string,
                role:Role
            }
        }
    }
}

router.post("/register", userController.createUser);

router.get("/me",(req: Request, res: Response, next: NextFunction)=>
    {
      const {accessToken} = req.cookies;
      console.log(accessToken);
    
      const verifiedToken = jwtUtils.verifiedToken(accessToken, config.jwt_access_secret);
    
      if(typeof verifiedToken === "string"){
        throw new Error(verifiedToken);
      }

      const {email, id, role, name}= verifiedToken;
      
      const requiredRole = [Role.ADMIN, Role.USER, Role.AUTHOR]

      if(!requiredRole.includes(role)){
        return res.status(403).json({
            success: false,
            statusCode: httpStatus.FORBIDDEN,
            message: "Forbidden entry!"
        })
      }
      
      req.user={
        name,
        email,
        role,
        id
      }

      next();
    },
 userController.getMyProfile);


export const userRoutes = router;