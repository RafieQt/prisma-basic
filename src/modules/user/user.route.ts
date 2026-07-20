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
import { auth } from "../../middlewares/auth";

const router = Router();



router.post("/register", userController.createUser);



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

router.put("/my-profile", auth(Role.ADMIN, Role.USER, Role.AUTHOR), userController.updateMyProfile)

export const userRoutes = router;
