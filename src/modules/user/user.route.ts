import { NextFunction, Request, Response, Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../midddlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", userController.registerUser);

router.get(
  "/me",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  userController.getMyProfile,
);

router.get("/all-users", auth(Role.ADMIN), userController.getAllUsers);

router.put(
  "/my-profile",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  userController.updateMyProfile,
);

router.patch(
  "/users/:id",
  auth(Role.ADMIN),
  userController.updateUserStatus,
);

export const userRoutes = router;
