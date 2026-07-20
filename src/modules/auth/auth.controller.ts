import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const loginUser = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const payload = req.body;

    const {accessToken, refreshToken} = await authService.loginUser(payload);

    res.cookie("accessToken", accessToken, {
        httpOnly:true,
        secure:false,
        sameSite: "none",
        maxAge: 24*60*60*1000
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly:true,
        sameSite: "none",
        secure: false,
        maxAge: 7*24*60*60*1000
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User login successful!", 
        data: {accessToken, refreshToken}
    })

})




export const authController = {
    loginUser,
}