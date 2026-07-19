import { NextFunction, Request, RequestHandler, Response } from "express";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";




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

export const userController = {
  createUser,
};
