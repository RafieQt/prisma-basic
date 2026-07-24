import { error } from "node:console";
import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreatePostPayload, IUpdatePostPayload } from "./post.interface";

const createPost = async (payload: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });

  return result;
};

const getAllPosts = async () => {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });

  return posts;
};

const getPostsById = async (postId: string) => {
  // await prisma.post.update({
  //   where: {
  //     id: postId,
  //   },
  //   data: {
  //     views: {
  //       increment: 1,
  //     },
  //   },
  // });
  // // throw new Error("Fake error!");
  // const post = await prisma.post.findUniqueOrThrow({
  //   where: {
  //     id: postId,
  //   },
  //   include: {
  //     author: {
  //       omit: {
  //         password: true,
  //       },
  //     },
  //     comments: {
  //       where: {
  //         status: CommentStatus.APPROVED,
  //       },
  //       orderBy: {
  //         createdAt: "desc",
  //       },
  //     },
  //     _count: {
  //       select: {
  //         comments: true,
  //       },
  //     },
  //   },
  // });
  // return post;

  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const post = await tx.post.findUniqueOrThrow({
      where: {
        id: postId,
      },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comments: {
          where: {
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    return post;
  });

  return transactionResult;
};

const getMyPosts = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      comments: true,
      author: {
        omit: {
          password: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return result;
};

const updatePost = async (
  postId: string,
  payload: IUpdatePostPayload,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("Unauthorized activity! Only owner and admin are allowed!");
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data: payload,
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });

  return result;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("Unauthorized activity! Only owner and admin are allowed!");
  }
  await prisma.post.delete({
    where: {
      id: postId,
    },
  });
};

const getPostsStats = async () => {
  const transactionResult = prisma.$transaction(async (tx) => {
    const totalPosts = await prisma.post.count();

    const totalPublishedPosts = await prisma.post.count({
      where: {
        status: PostStatus.PUBLISHED,
      },
    });
    const totalArchivedPosts = await prisma.post.count({
      where: {
        status: PostStatus.ARCHIVE,
      },
    });
    const totalDraftPosts = await prisma.post.count({
      where: {
        status: PostStatus.DRAFT,
      },
    });
    const totalComments = await prisma.comment.count();

    const totalApprovedComments = await prisma.comment.count({
      where: {
        status: CommentStatus.APPROVED,
      },
    });
    const totalRejectedComments = await prisma.comment.count({
      where: {
        status: CommentStatus.REJECTED,
      },
    });

    return {
      totalPosts,
      totalPublishedPosts,
      totalArchivedPosts,
      totalDraftPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
    };
  });

  return transactionResult;
};

export const postService = {
  createPost,
  getAllPosts,
  getPostsById,
  getMyPosts,
  updatePost,
  deletePost,
  getPostsStats,
};
