import { Router } from "express";
import { rentalController } from "./rental.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../midddlewares/auth";

const router = Router();

router.post(
  "/",
  auth(Role.TENANT),
  rentalController.createRentalRequest
);

router.get(
  "/",
  auth(Role.TENANT, Role.LANDLORD),
  rentalController.getMyRentalRequests
);

router.get(
  "/:id",
  auth(Role.TENANT, Role.LANDLORD),
  rentalController.getRentalRequestById
);

router.patch(
  "/landlord/requests/:id",
  auth(Role.LANDLORD),
  rentalController.updateRentalRequestStatus
);

router.get(
  "/admin/rentals",
  auth(Role.ADMIN),
  rentalController.adminGetAllRentalRequests
);

export const rentalRoutes = router;