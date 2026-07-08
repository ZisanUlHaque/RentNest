import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../midddlewares/auth";
import { Role } from "../../../generated/prisma/enums";


const router = Router();


router.post("/webhook", paymentController.handleWebhook);

router.post(
  "/create",
  auth(Role.TENANT),
  paymentController.createCheckoutSession
);


router.get(
  "/",
  auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  paymentController.getMyPayments
);

router.get(
  "/:id",
  auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  paymentController.getPaymentById
);

export const paymentRoutes = router;