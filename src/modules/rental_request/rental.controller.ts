import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";
import { IRentalRequestQuery } from "./rental.interface";

const createRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const payload = req.body;

    const result = await rentalService.createRentalRequest(
      payload,
      tenantId as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Rental request submitted successfully",
      data: result,
    });
  }
);

const getMyRentalRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const query = req.query as IRentalRequestQuery;

    const result = await rentalService.getMyRentalRequests(
      userId as string,
      role as string,
      query
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requests retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getRentalRequestById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.params.id;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!requestId) {
      throw new Error("Request Id Required In Params");
    }

    const result = await rentalService.getRentalRequestById(
      requestId as string,
      userId as string,
      role as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental request retrieved successfully",
      data: result,
    });
  }
);

const updateRentalRequestStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const requestId = req.params.id;

    if (!requestId) {
      throw new Error("Request Id Required In Params");
    }

    const payload = req.body;

    const result = await rentalService.updateRentalRequestStatus(
      requestId as string,
      payload,
      landlordId as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental request status updated successfully",
      data: result,
    });
  }
);

const adminGetAllRentalRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as IRentalRequestQuery;

    const result = await rentalService.adminGetAllRentalRequests(query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All rental requests retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

export const rentalController = {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestById,
  updateRentalRequestStatus,
  adminGetAllRentalRequests,
};