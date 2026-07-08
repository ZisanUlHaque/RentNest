import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import {
  PaymentStatus,
  PropertyStatus,
  RentalRequestStatus,
} from "../../../generated/prisma/enums";

export const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const rentalRequestId = session.metadata?.rentalRequestId;
  const tenantId = session.metadata?.tenantId;
  const stripeCheckoutSessionId = session.id;

  const stripePaymentIntentId = session.payment_intent as string;

  if (!rentalRequestId || !tenantId) {
    console.log("Webhook: Missing metadata in checkout session");
    return;
  }

  const payment = await prisma.payment.findUnique({
    where: { stripeCheckoutSessionId },
  });

  if (!payment) {
    console.log(
      `Webhook: No payment found for session: ${stripeCheckoutSessionId}`,
    );
    return;
  }

  if (payment.status === PaymentStatus.COMPLETED) {
    console.log(
      `Webhook: Payment already completed for session: ${stripeCheckoutSessionId}`,
    );
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { stripeCheckoutSessionId },
      data: {
        status: PaymentStatus.COMPLETED,
        stripePaymentIntentId,
        paidAt: new Date(),
      },
    });

    await tx.rentalRequest.update({
      where: { id: rentalRequestId },
      data: {
        status: RentalRequestStatus.ACTIVE,
      },
    });

    const rentalRequest = await tx.rentalRequest.findUnique({
      where: { id: rentalRequestId },
    });

    if (rentalRequest) {
      await tx.property.update({
        where: { id: rentalRequest.propertyId },
        data: {
          status: PropertyStatus.RENTED,
        },
      });
    }
  });

  console.log(`✅ Payment completed for rentalRequest: ${rentalRequestId}`);
};

export const handleCheckoutSessionFailed = async (
  session: Stripe.Checkout.Session,
) => {
  const stripeCheckoutSessionId = session.id;

  const payment = await prisma.payment.findUnique({
    where: { stripeCheckoutSessionId },
  });

  if (!payment) {
    console.log(
      `Webhook: No payment found for session: ${stripeCheckoutSessionId}`,
    );
    return;
  }

  await prisma.payment.update({
    where: { stripeCheckoutSessionId },
    data: {
      status: PaymentStatus.FAILED,
    },
  });

  await prisma.rentalRequest.update({
    where: { id: payment.rentalRequestId },
    data: {
      status: RentalRequestStatus.APPROVED,
    },
  });

  console.log(`❌ Payment failed for session: ${stripeCheckoutSessionId}`);
};
