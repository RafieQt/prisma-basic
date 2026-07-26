import { error } from "node:console";
import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  ICreatePostPayload,
  IPostQuery,
  IUpdatePostPayload,
} from "./post.interface";
import { PostWhereInput } from "../../../generated/prisma/models";

const createPost = async (payload: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });

  return result;
};

const getAllPosts = async (query: IPostQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const tags = query.tags ? JSON.parse(query.tags as string) : null;
  const tagsArray = Array.isArray(tags) ? tags : [];

  const andCondition: PostWhereInput[] = [];
  
  if (query.searchTerm) {
    andCondition.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }
  if(query.title){
    andCondition.push({
      title: query.title
    })
  }
  if(query.content){
    andCondition.push({
      content: query.content
    })
  }
  if(query.isFeatured){
    andCondition.push({
      isFeatured: Boolean(query.isFeatured)
    })
  }
  if(query.tags){
    andCondition.push({
      tags:{
        hasSome: tagsArray
      }
    })
  }
  if(query.status){
    andCondition.push({
      status: query.status
    })
  }

  const posts = await prisma.post.findMany({
    // where: {
    //   AND: [
    //     query.searchTerm
    //       ? {
    //           OR: [
    //             {
    //               title: {
    //                 contains: query.searchTerm,
    //                 mode: "insensitive",
    //               },
    //             },
    //             {
    //               content: {
    //                 contains: query.searchTerm,
    //                 mode: "insensitive",
    //               },
    //             },
    //           ],
    //         }
    //       : {},

    //     // title filtering
    //     query.title
    //       ? {
    //           title: query.title,
    //         }
    //       : {},

    //     // content filtering
    //     query.content ? { content: query.content } : {},
    //   ],
    // },

    where:{
      AND:andCondition
    },
    take: limit,
    skip: skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

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
    // const totalPosts = await prisma.post.count();

    // const totalPublishedPosts = await prisma.post.count({
    //   where: {
    //     status: PostStatus.PUBLISHED,
    //   },
    // });
    // const totalArchivedPosts = await prisma.post.count({
    //   where: {
    //     status: PostStatus.ARCHIVE,
    //   },
    // });
    // const totalDraftPosts = await prisma.post.count({
    //   where: {
    //     status: PostStatus.DRAFT,
    //   },
    // });
    // const totalComments = await prisma.comment.count();

    // const totalApprovedComments = await prisma.comment.count({
    //   where: {
    //     status: CommentStatus.APPROVED,
    //   },
    // });
    // const totalRejectedComments = await prisma.comment.count({
    //   where: {
    //     status: CommentStatus.REJECTED,
    //   },
    // });

    // let totalViewsAggregate = await tx.post.aggregate({
    //   _sum: { views: true },
    // });

    // const totalViews = totalViewsAggregate._sum.views;

    // return {
    //   totalPosts,
    //   totalPublishedPosts,
    //   totalArchivedPosts,
    //   totalDraftPosts,
    //   totalComments,
    //   totalApprovedComments,
    //   totalRejectedComments,
    //   totalViews
    // };

    const [
      totalPosts,
      totalPublishedPosts,
      totalArchivedPosts,
      totalDraftPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalViewsAggregate,
    ] = await Promise.all([
      await tx.post.count(),
      await prisma.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),
      await prisma.post.count({
        where: {
          status: PostStatus.ARCHIVE,
        },
      }),
      await prisma.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),
      await prisma.comment.count(),
      await prisma.comment.count({
        where: {
          status: CommentStatus.APPROVED,
        },
      }),
      await prisma.comment.count({
        where: {
          status: CommentStatus.REJECTED,
        },
      }),
      await tx.post.aggregate({
        _sum: { views: true },
      }),
    ]);

    return {
      totalPosts,
      totalPublishedPosts,
      totalArchivedPosts,
      totalDraftPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalViews: totalViewsAggregate._sum.views,
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
