import { NextFunction, Request, Response } from "express";

import { reviewServices } from "./review.service";

import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;

    const result = await reviewServices.createReview(tenantId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Review created successfully",
      data: result,
    });
  }
);


const getReviewsByPropertyId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { propertyId } = req.params;

    const result = await reviewServices.getReviewsByPropertyId(propertyId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Reviews retrieved successfully",
      data: result,
    });
  }
);

export const reviewController = {
  createReview,
  getReviewsByPropertyId,
};