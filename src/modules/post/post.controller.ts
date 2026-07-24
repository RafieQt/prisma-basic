import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { postService } from "./post.service";
import { sendResponse } from "../../utils/sendResponse";
import HttpStatus from "http-status";

const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    const payload = req.body;

    const result = await postService.createPost(payload, id as string);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Post has been created!",
      data: result,
    });
  },
);

const getAllPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await postService.getAllPosts();
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Posts are fetched!",
      data: result,
    });
  },
);

const getPostsStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

const getMyPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const userId = req.user?.id;
    
    const result = await postService.getMyPosts(userId as string);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "My Posts are fetched!",
      data: result,
    })
  },
);

const getPostsById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;

    if(!postId){
      throw new Error("Post ID is required in Params!");
    }

    const result = await postService.getPostsById(postId as string);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Post has been fetched!",
      data: result,
    })
  },
);

const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const isAdmin = req.user?.role==="ADMIN" ? true : false;

    const postId = req.params.postId;
    const payload = req.body;

    if(!postId){
      throw new Error("Post Id is needed in params!");
    }

    const result = await postService.updatePost(postId as string, payload, authorId as string, isAdmin);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Post has been updated!",
      data: result,
    })

  },
);

const deleteId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const isAdmin = req.user?.role==="ADMIN" ? true : false;

    const postId = req.params.postId;


    if(!postId){
      throw new Error("Post Id is needed in params!");
    }

    await postService.deletePost(postId as string,  authorId as string, isAdmin);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Post has been Deleted!",
      data: null,
    })
  },
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
