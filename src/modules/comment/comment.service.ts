import { prisma } from "../../lib/prisma";
import {
  ICreateCommentPayload,
  IModerateCommentPayload,
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

const deleteComment = async (commentId: string, authorId: string) => {
  const commentData = await prisma.comment.findUniqueOrThrow({
    where: {
      id: commentId,
      authorId,
    },
    select: {
      id: true,
    },
  });
  const comment = await prisma.comment.delete({
    where: {
      id: commentData.id,
    },
  });
  return comment;
};

const moderateComment = async (
  payload: IModerateCommentPayload,
  commentId: string,
) => {
  const commentData = await prisma.comment.findUniqueOrThrow({
    where: {
      id: commentId,
    },

    select: {
      id: true,
      status: true
    },
  });

  if(commentData.status=== payload.status){
    throw new Error(`Your provided status (${payload.status}) is already up to data!`);
  }

  const result = prisma.comment.update({
    where: {
      id: commentId,
    },
    data: payload,
  });
  return result;
};

export const commentService = {
  createComment,
  getCommentByAuthorId,
  getCommentByCommentId,
  updateComment,
  deleteComment,
  moderateComment,
};
