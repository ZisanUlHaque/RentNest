import { Router } from "express";
import { propertyController } from "./property.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../midddlewares/auth";

const router = Router();

router.get("/", propertyController.getAllProperties);
router.get("/:propertyId", propertyController.getPropertyById);

// Landlord routes
router.post("/", auth(Role.LANDLORD), propertyController.createProperty);

router.get(
  "/landlord/my-properties",
  auth(Role.LANDLORD),
  propertyController.getMyProperties,
);

router.put(
  "/:propertyId",
  auth(Role.LANDLORD),
  propertyController.updateProperty,
);

router.delete(
  "/:propertyId",
  auth(Role.LANDLORD),
  propertyController.deleteProperty,
);

// Admin routes
router.get(
  "/admin/all",
  auth(Role.ADMIN),
  propertyController.adminGetAllProperties,
);

export const propertyRoutes = router;
