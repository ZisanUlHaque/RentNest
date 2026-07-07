import { Router } from "express";
import { auth } from "../../midddlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { categoryContoller } from "./category.controller";

const router = Router();

router.get("/", categoryContoller.getAllCategory);
router.post("/", auth(Role.ADMIN), categoryContoller.createCategory);
router.patch("/:categoryId",auth(Role.ADMIN), categoryContoller.updateCategory)
router.delete("/:categoryId",auth(Role.ADMIN), categoryContoller.deleteCategory)

export const categoryRoutes = router;
