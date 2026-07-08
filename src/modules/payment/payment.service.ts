import httpStatus from "http-status";
import {
  handleCheckoutSessionCompleted,
  handleCheckoutSessionFailed,
} from "./payment.utils";

import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import {
  PaymentStatus,
  RentalRequestStatus,
  Role,
} from "../../../generated/prisma/enums";
import { stripe } from "../../lib/stripe";
import config from "../../config";

const createCheckoutSession = async (
  tenantId: string,
  rentalRequestId: string,
) => {
  const result = await prisma.$transaction(async (tx) => {
    const rentalRequest = await tx.rentalRequest.findUnique({
      where: { id: rentalRequestId },
      include: {
        property: true,
        payment: true,
        tenant: true,
      },
    });

    if (!rentalRequest) {
      throw new Error("Rental request not found");
    }

    if (rentalRequest.tenantId !== tenantId) {
      throw new Error("You are not authorized to pay for this rental");
    }

    if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
      throw new Error(
        `Rental request must be APPROVED before payment. Current status: ${rentalRequest.status}`,
      );
    }

    if (rentalRequest.payment?.status === PaymentStatus.COMPLETED) {
      throw new Error("Payment already completed for this rental");
    }

    const totalAmount =
      Number(rentalRequest.property.rentPerMonth) *
      rentalRequest.durationMonths;

    const amountInPaisa = Math.round(totalAmount * 100);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Rent: ${rentalRequest.property.title}`,
              description: `${rentalRequest.durationMonths} month(s) rental at ${rentalRequest.property.location}`,
            },
            unit_amount: amountInPaisa,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: rentalRequest.tenant.email,
      payment_method_types: ["card"],
      success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.app_url}/payment/cancel`,
      metadata: {
        tenantId,
        rentalRequestId,
        propertyId: rentalRequest.propertyId,
      },
    });

    await tx.payment.upsert({
      where: { rentalRequestId },
      create: {
        rentalRequestId,
        tenantId,
        amount: totalAmount,
        currency: "bdt",
        stripeCheckoutSessionId: session.id,
        status: PaymentStatus.PENDING,
      },
      update: {
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: null,
        status: PaymentStatus.PENDING,
        amount: totalAmount,
      },
    });

    await tx.rentalRequest.update({
      where: { id: rentalRequestId },
      data: {
        status: RentalRequestStatus.PAYMENT_PENDING,
      },
    });

    return {
      paymentUrl: session.url,
      sessionId: session.id,
    };
  });

  return result;
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret as string;


  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      break;

    case "checkout.session.expired":
      await handleCheckoutSessionFailed(
        event.data.object as Stripe.Checkout.Session,
      );
      break;

    default:
      console.log(`Unhandled webhook event: ${event.type}`);
      break;
  }
};

// ─────────────────────────────────────────────────────────────

const getMyPayments = async (userId: string, role: string) => {
  if (role === Role.ADMIN) {
    return await prisma.payment.findMany({
      include: {
        rentalRequest: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                location: true,
                rentPerMonth: true,
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (role === Role.LANDLORD) {
    return await prisma.payment.findMany({
      where: {
        rentalRequest: {
          property: {
            landlordId: userId,
          },
        },
      },
      include: {
        rentalRequest: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                location: true,
                rentPerMonth: true,
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return await prisma.payment.findMany({
    where: { tenantId: userId },
    include: {
      rentalRequest: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              location: true,
              rentPerMonth: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentById = async (
  paymentId: string,
  userId: string,
  role: string,
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      rentalRequest: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              location: true,
              rentPerMonth: true,
              landlord: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (role === Role.TENANT && payment.tenantId !== userId) {
    throw new Error("You are not authorized to view this payment");
  }

  if (role === Role.LANDLORD) {
    const landlordId = payment.rentalRequest.property.landlord.id;
    if (landlordId !== userId) {
      throw new Error("You are not authorized to view this payment");
    }
  }

  return payment;
};

export const paymentServices = {
  createCheckoutSession,
  handleWebhook,
  getMyPayments,
  getPaymentById,
};
