import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { PaymentStatus, RentalRequestStatus } from "../../../generated/prisma/enums";



// ─────────────────────────────────────────────────────────────
// CREATE REVIEW
// ─────────────────────────────────────────────────────────────
const createReview = async (
  tenantId: string,
  payload: {
    propertyId: string;
    rentalRequestId: string;
    rating: number;
    comment?: string;
  }
) => {
  const { propertyId, rentalRequestId, rating, comment } = payload;

  // 1. manual validation
  if (!propertyId) {
    throw new Error( "Property ID is required");
  }

  if (!rentalRequestId) {
    throw new Error("Rental request ID is required");
  }

  if (!rating) {
    throw new Error( "Rating is required");
  }

  if (typeof rating !== "number" || !Number.isInteger(rating)) {
    throw new Error( "Rating must be an integer");
  }

  if (rating < 1 || rating > 5) {
    throw new Error(
      "Rating must be between 1 and 5"
    );
  }

  // 2. find rental request with payment and review
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: {
      payment: true,
      review: true,
    },
  });

  // 3. rental request exists?
  if (!rentalRequest) {
    throw new Error("Rental request not found");
  }

  // 4. only the tenant of this rental can review
  if (rentalRequest.tenantId !== tenantId) {
    throw new Error(
      "You are not authorized to review this rental"
    );
  }

  // 5. rental must belong to this property
  if (rentalRequest.propertyId !== propertyId) {
    throw new Error(
      "This rental request does not belong to the specified property"
    );
  }

  // 6. rental must be ACTIVE or COMPLETED
  const allowedStatuses: RentalRequestStatus[] = [
    RentalRequestStatus.ACTIVE,
    RentalRequestStatus.COMPLETED,
  ];

  if (!allowedStatuses.includes(rentalRequest.status)) {
    throw new Error(
      `Cannot review. Rental status must be ACTIVE or COMPLETED. Current: ${rentalRequest.status}`
    );
  }

  // 7. payment must exist and be COMPLETED
  if (!rentalRequest.payment) {
    throw new Error(
      "No payment found. Payment must be completed before review."
    );
  }

  if (rentalRequest.payment.status !== PaymentStatus.COMPLETED) {
    throw new Error(
      `Payment must be completed before review. Current: ${rentalRequest.payment.status}`
    );
  }

  // 8. already reviewed?
  if (rentalRequest.review) {
    throw new Error(
      "You have already reviewed this rental"
    );
  }

  // 9. property exists?
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new Error( "Property not found");
  }

  // 10. create review
  const review = await prisma.review.create({
    data: {
      propertyId,
      tenantId,
      rentalRequestId,
      rating,
      comment,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      property: {
        select: {
          id: true,
          title: true,
          location: true,
        },
      },
    },
  });

  return review;
};

// ─────────────────────────────────────────────────────────────
// GET ALL REVIEWS FOR A PROPERTY (Public)
// ─────────────────────────────────────────────────────────────
const getReviewsByPropertyId = async (propertyId: string) => {
  // 1. property exists?
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  // 2. get all reviews
  const reviews = await prisma.review.findMany({
    where: { propertyId },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. calculate stats
  const stats = await prisma.review.aggregate({
    where: { propertyId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    reviews,
    averageRating: stats._avg.rating
      ? Number(stats._avg.rating.toFixed(1))
      : 0,
    totalReviews: stats._count.rating,
  };
};

export const reviewServices = {
  createReview,
  getReviewsByPropertyId,
};