import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { postService } from "./post.service";
import { sendResponse } from "../../utils/sendResponse";
import  HttpStatus  from "http-status";

const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    const payload = req.body;

    const result = await postService.createPost(payload, id as string);

    sendResponse(res, {
        success: true,
        statusCode: HttpStatus.OK,
        message: "Post has been created!",
        data: result
    })
  },
);

const getAllPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

const getPostsStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

const getMyPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

const getPostsById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

const deleteId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const postController = {
  createPost,
  getAllPosts,
  getPostsStats,
  getMyPosts,
  getPostsById,
  updatePost,
  deleteId,
};
