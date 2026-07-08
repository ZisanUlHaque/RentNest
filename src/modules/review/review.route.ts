import { Router } from "express";
import { reviewController } from "./review.controller";
import { auth } from "../../midddlewares/auth";
import { Role } from "../../../generated/prisma/enums";


const router = Router();

router.post(
  "/",
  auth(Role.TENANT),
  reviewController.createReview
);

router.get(
  "/property/:propertyId",
  reviewController.getReviewsByPropertyId
);

export const reviewRoutes = router;