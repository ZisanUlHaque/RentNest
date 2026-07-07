import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { IUpdateUserStatusPayload, RegisterUserPayload } from "./user.interface";
import { ActiveStatus } from "../../../generated/prisma/enums";
import { IUpdateCategoryPayload } from "../category/category.interface";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { name, email, password, profilePhoto, role, phone } = payload;
  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
      email: createdUser.email || email,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

const getMyProfileFromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: {
      password: true,
    },
  });

  return user;
};

const updateMyProfileIntoDB = async (userId: string, payload: any) => {
  const { name, email, profilePhoto } = payload;

  const updateUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name,
      email,
      profilePhoto,
    },
    omit: {
      password: true,
    },
  });
  return updateUser;
};

const getAllUsers = async (query: {
  role?: string;
  activeStatus?: string;
}) => {
  const where: Record<string, unknown> = {};

  if (query.role) {
    where.role = query.role;
  }

  if (query.activeStatus) {
    where.activeStatus = query.activeStatus;
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      activeStatus: true,
      phone: true,
      profilePhoto: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};

const updateUserStatus = async (
  adminId: string,
  userId: string,
  payload: IUpdateUserStatusPayload
) => {
  if (adminId === userId) {
    throw new Error("You cannot change your own status.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return prisma.user.update({
    where: { id: userId },
    omit : {
      password : true
    },
    data: payload,
  });
};

export const userService = {
  registerUserIntoDB,
  getMyProfileFromDB,
  updateMyProfileIntoDB,
  getAllUsers,
  updateUserStatus,
};
