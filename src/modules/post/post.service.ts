import { prisma } from "../../lib/prisma";
import { ICreatePostPayload } from "./post.interface";


const createPost = async(payload: ICreatePostPayload, userId: string)=>{
    const result = await prisma.post.create({
        data:{
            ...payload,
            authorId: userId
        } 
    })

    return result;
}


export const postService = {
    createPost
}