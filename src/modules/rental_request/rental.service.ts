import { RentalRequestWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  ICreateRentalRequestPayload,
  IRentalRequestQuery,
  IUpdateRentalRequestPayload,
} from "./rental.interface";
import { RentalRequestStatus } from "../../../generated/prisma/enums";


const createRentalRequest = async (
  payload: ICreateRentalRequestPayload,
  tenantId: string
) => {

  const property = await prisma.property.findUniqueOrThrow({
    where: { id: payload.propertyId },
  });

  if (!property.status) {
    throw new Error("This property is not available for rent.");
  }

  const existingRequest = await prisma.rentalRequest.findUnique({
    where: {
      tenantId_propertyId: {
        tenantId,
        propertyId: payload.propertyId,
      },
    },
  });

  if (existingRequest) {
    throw new Error(
      "You have already submitted a rental request for this property."
    );
  }

  const result = await prisma.rentalRequest.create({
    data: {
      ...payload,
      tenantId,
      moveInDate: new Date(payload.moveInDate),
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          rentPerMonth: true,
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  return result;
};



const getMyRentalRequests = async (
  userId: string,
  role: string,
  query: IRentalRequestQuery
) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: RentalRequestWhereInput[] = [];

  if (role === "TENANT") {
    andConditions.push({ tenantId: userId });
  } else if (role === "LANDLORD") {
    andConditions.push({
      property: {
        landlordId: userId,
      },
    });
  }

  if (query.status) {
    andConditions.push({ status: query.status });
  }

  const requests = await prisma.rentalRequest.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { [sortBy]: sortOrder },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          rentPerMonth: true,
          images: true,
          landlord: {
            select: { id: true, name: true, profilePhoto: true },
          },
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          phone: true,
        },
      },
    },
  });

  const total = await prisma.rentalRequest.count({
    where: { AND: andConditions },
  });

  return {
    data: requests,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getRentalRequestById = async (
  requestId: string,
  userId: string,
  role: string
) => {
  const request = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: {
      property: {
        include: {
          landlord: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              phone: true,
            },
          },
          category: { select: { id: true, name: true } },
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          phone: true,
        },
      },
    },
  });


  if (role === "TENANT" && request.tenantId !== userId) {
    throw new Error("You are not authorized to view this request.");
  }

  if (role === "LANDLORD" && request.property.landlord.id !== userId) {
    throw new Error("You are not authorized to view this request.");
  }

  return request;
};



const updateRentalRequestStatus = async (
  requestId: string,
  payload: IUpdateRentalRequestPayload,
  landlordId: string
) => {
  const request = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: {
      property: { select: { landlordId: true } },
    },
  });


  if (request.property.landlordId !== landlordId) {
    throw new Error(
      "You are not authorized to update this rental request."
    );
  }

  if (
    request.status === RentalRequestStatus.APPROVED ||
    request.status === RentalRequestStatus.REJECTED
  ) {
    throw new Error(
      `This request has already been ${request.status.toLowerCase()}.`
    );
  }

  const result = await prisma.rentalRequest.update({
    where: { id: requestId },
    data: { status: payload.status },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          rentPerMonth: true,
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  return result;
};


const adminGetAllRentalRequests = async (query: IRentalRequestQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: RentalRequestWhereInput[] = [];

  if (query.status) {
    andConditions.push({ status: query.status });
  }

  const requests = await prisma.rentalRequest.findMany({
    where: {
      AND: andConditions.length > 0 ? andConditions : undefined,
    },
    take: limit,
    skip,
    orderBy: { [sortBy]: sortOrder },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          rentPerMonth: true,
          landlord: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  const total = await prisma.rentalRequest.count({
    where: {
      AND: andConditions.length > 0 ? andConditions : undefined,
    },
  });

  return {
    data: requests,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const rentalService = {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestById,
  updateRentalRequestStatus,
  adminGetAllRentalRequests,
};