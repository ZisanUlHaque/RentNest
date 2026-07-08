import { PropertyWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  ICreatePropertyPayload,
  IPropertyQuery,
  IUpdatePropertyPayload,
} from "./property.interface";

const createProperty = async (
  payload: ICreatePropertyPayload,
  landlordId: string
) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  const result = await prisma.property.create({
    data: {
      ...payload,
      landlordId,
    },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  return result;
};

const getAllProperties = async (query: IPropertyQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: PropertyWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: query.searchTerm, mode: "insensitive" } },
        { description: { contains: query.searchTerm, mode: "insensitive" } },
        { location: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (query.location) {
    andConditions.push({
      location: { contains: query.location as string, mode: "insensitive" },
    });
  }

  if (query.categoryId) {
    andConditions.push({
      categoryId: query.categoryId as string,
    });
  }

  if (query.minRent || query.maxRent) {
    andConditions.push({
      rentPerMonth: {
        ...(query.minRent && { gte: Number(query.minRent) }),
        ...(query.maxRent && { lte: Number(query.maxRent) }),
      },
    });
  }


  if (query.status !== undefined) {
    andConditions.push({
      status: query.status
    });
  }

  const properties = await prisma.property.findMany({
    where: {
      AND: andConditions,
    },
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      category: { select: { id: true, name: true } },
      landlord: {
        select: { id: true, name: true, profilePhoto: true },
      },
      _count: { select: { rentalRequests: true, reviews: true } },
    },
  });

  const total = await prisma.property.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: properties,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getPropertyById = async (propertyId: string) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: { id: propertyId },
    include: {
      category: true,
      landlord: {
        select: { id: true, name: true, profilePhoto: true, phone: true },
      },
      reviews: {
        include: {
          tenant: { select: { id: true, name: true, profilePhoto: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { rentalRequests: true, reviews: true } },
    },
  });

  return property;
};

const updateProperty = async (
  propertyId: string,
  payload: IUpdatePropertyPayload,
  landlordId: string,
  isAdmin: boolean
) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: { id: propertyId },
  });

  if (!isAdmin && property.landlordId !== landlordId) {
    throw new Error("You can only update your own properties.");
  }

  const result = await prisma.property.update({
    where: { id: propertyId },
    data: payload,
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  return result;
};

const deleteProperty = async (
  propertyId: string,
  landlordId: string,
  isAdmin: boolean
) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: { id: propertyId },
  });

  if (!isAdmin && property.landlordId !== landlordId) {
    throw new Error("You can only delete your own properties.");
  }

  const activeRequest = await prisma.rentalRequest.findFirst({
    where: {
      propertyId,
      status: { in: ["APPROVED", "ACTIVE", "PAYMENT_PENDING"] },
    },
  });

  if (activeRequest) {
    throw new Error("Cannot delete property with active rental requests.");
  }

  await prisma.property.delete({ where: { id: propertyId } });

  return null;
};

const adminGetAllProperties = async (query: IPropertyQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const properties = await prisma.property.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      landlord: { select: { id: true, name: true, email: true } },
      _count: { select: { rentalRequests: true, reviews: true } },
    },
  });

  const total = await prisma.property.count();

  return {
    data: properties,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getMyProperties = async (landlordId: string) => {
  const result = await prisma.property.findMany({
    where: { landlordId },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { rentalRequests: true, reviews: true } },
    },
  });

  return result;
};

export const propertyService = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  adminGetAllProperties,
  getMyProperties,
};