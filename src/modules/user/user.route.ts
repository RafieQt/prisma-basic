import bcrypt from "bcryptjs";
import { Request, Response, Router } from "express";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import  httpStatus  from "http-status";
import { userController } from "./user.contoller";

const router = Router();

router.post("/register", userController.createUser);


export const userRoutes = router;