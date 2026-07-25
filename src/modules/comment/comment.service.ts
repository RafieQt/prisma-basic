import { prisma } from "../../lib/prisma";
import {
  ICreateCommentPayload,
  IUpdateCommentPayload,
} from "./comment.interface";

const createComment = async (
  authorId: string,
  payload: ICreateCommentPayload,
) => {
  await prisma.post.findUniqueOrThrow({
    where: {
      id: payload.postId,
    },
  });
  const comment = prisma.comment.create({
    data: {
      ...payload,
      authorId,
    },
  });

  return comment;
};

const getCommentByAuthorId = async (authorId: string) => {
  const result = await prisma.comment.findMany({
    where: {
      id: authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
  return result;
};

const getCommentByCommentId = async (commentId: string) => {
  const result = await prisma.comment.findUniqueOrThrow({
    where: {
      id: commentId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
    },
  });

  return result;
};

const updateComment = async (
  commentId: string,
  payload: IUpdateCommentPayload,
  authorId: string,
) => {
  const comment = await prisma.comment.findUniqueOrThrow({
    where: {
      id: commentId,
      authorId,
    },
    select: {
      id: true,
    },
  });
  const upComment = await prisma.comment.update({
    where: {
      id: commentId,
      authorId,
    },
    data: payload,
  });

  return upComment;
};

export const commentService = {
  createComment,
  getCommentByAuthorId,
  getCommentByCommentId,
  updateComment,
};
