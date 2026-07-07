import { Router } from "express";
import { auth } from "../../midddlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { categoryContoller } from "./category.controller";

const router = Router();

router.post("/", auth(Role.ADMIN), categoryContoller.createCategory);

export const categoryRoutes = router;
