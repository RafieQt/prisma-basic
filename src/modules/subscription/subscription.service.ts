import { prisma } from "../../lib/prisma"
import { stripe } from "../../lib/stripe"

const createCheckoutSession = async(userId: string)=>{
    const transactionResult = await prisma.$transaction(async(tx)=>{
        const user = await prisma.user.findUniqueOrThrow({
            where:{
                id: userId
            },
            include:{
                subscription: true
            }
        })
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: {userId: userId}
        })
    })
}


export const subscriptionService = {
    createCheckoutSession
}