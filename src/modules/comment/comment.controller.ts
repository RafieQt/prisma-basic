import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { commentService } from "./comment.service";
import { sendResponse } from "../../utils/sendResponse";
import HttpStatus from "http-status";


const createComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const payload = req.body;
    const result = await commentService.createComment(authorId as string, payload);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Comment Created!",
      data: result,
    })
  },
);

const getCommentByAuthorId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {authorId} = req.params;
    const result = await commentService.getCommentByAuthorId(authorId as string);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Comments Fetched!",
      data: result,
    })

  },
);

const getCommentByCommentId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {commentId} = req.params;

    const result = await commentService.getCommentByCommentId(commentId as string);

    sendResponse(res,{
      success: true,
      statusCode: HttpStatus.OK,
      message: "Comment Fetched!",
      data: result,
    })
  },
);

const updateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const {commentId} = req.params;
    const authorId = req.user?.id;

    const result = await commentService.updateComment(commentId as string, payload, authorId as string)

    sendResponse(res,{
      success: true,
      statusCode: HttpStatus.OK,
      message: "Comment Updated!",
      data: result,
    })
  },
);

const deleteComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {commentId} = req.params;
    const authorId = req.user?.id;

    const result = await commentService.deleteComment(commentId as string, authorId as string);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Comment Deleted!",
      data: result,
    })
  },
);

const moderateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {commentId} = req.params;
    const payload = req.body;

    const result = await commentService.moderateComment(payload, commentId as string);
    
    sendResponse(res,{
      success: true,
      statusCode: HttpStatus.OK,
      message: "Comment Status updated!",
      data: result,
    })
  },
);

export const commentController = {
  createComment,
  getCommentByAuthorId,
  getCommentByCommentId,
  updateComment,
  deleteComment,
  moderateComment,
};
