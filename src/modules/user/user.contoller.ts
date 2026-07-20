import { NextFunction, Request, RequestHandler, Response } from "express";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import jwt from "jsonwebtoken";
import { jwtUtils } from "../../utils/jwt";
import strict from "node:assert/strict";
import { stringify } from "node:querystring";



// const createUser = async (req: Request, res: Response) => {
//   try {
//     const payload = req.body;

//     const user = await userService.registerUserIntoDB(payload);

//     res.status(httpStatus.CREATED).json({
//       success: true,
//       statusCode: httpStatus.CREATED,
//       message: "User Registered Successfully!",
//       data: {
//         user,
//       },
//     });
//   } catch (error) {
//     console.log(error);

//     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       message: "Failed to register User!",
//       error: (error as Error).message,
//     });
//   }
// };



const createUser = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
  const payload = req.body;

  const user = await userService.registerUserIntoDB(payload);

  // res.status(httpStatus.CREATED).json({
  //     success: true,
  //     statusCode: httpStatus.CREATED,
  //     message: "User Registered Successfully!",
  //     data: {
  //       user,
  //     },
  //   });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User Registered Successfully!",
    data:{
      user
    }
  })
})



const getMyProfile = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{

  const {accessToken} = req.cookies;
  console.log(req.user, "User request!");

  // const verifiedToken = jwtUtils.verifiedToken(accessToken, config.jwt_access_secret);

  // if(typeof verifiedToken === "string"){
  //   throw new Error(verifiedToken);
  // }

  const profile = await userService.getMyProfileFromDB(req.user?.id as string)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message:"User profile fetched successfully",
    data:{profile}
  })

})


const updateMyProfile= catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
  const userId = req.user?.id as string;

  const payload = req.body;

  const updateProfile = await userService.updateMyProfileDB(userId, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your profile has been updated!",
    data:{updateMyProfile}
  })
})

export const userController = {
  createUser,
  getMyProfile,
  updateMyProfile
};
