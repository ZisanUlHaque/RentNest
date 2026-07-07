import { prisma } from "../../lib/prisma";
import { IcraeteCategory, IUpdateCategoryPayload } from "./category.interface";

const createCategoryIntoDB = async (payload: IcraeteCategory) => {
  const { name, description } = payload;
  const isCategoryExist = await prisma.category.findUnique({
    where: { name },
  });

  if (isCategoryExist) {
    throw new Error("Category with this name already exists");
  }

  const createCategory = await prisma.category.create({
    data: {
      name,
      description,
    },
  });

  const category = await prisma.category.findUnique({
    where: {
      id: createCategory.id,
      name: createCategory.name,
    },
  });

  return category;
};

const getCategoryFromDB = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return categories;
};

const updateCategoryIntoDB = async (
  categoryId: string,
  payload: IUpdateCategoryPayload,
) => {
  await prisma.category.findUniqueOrThrow({
    where: { id: categoryId },
    select: { id: true },
  });

  return await prisma.category.update({
    where: { id: categoryId },
    data: payload,
  });
};

const deleteCategory = async (
  categoryId: string,
) => {
  const post = await prisma.category.findUniqueOrThrow({
    where: {
      id: categoryId,
    },
  });


  const result = await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });

  return null;
};

export const categoryService = {
  createCategoryIntoDB,
  getCategoryFromDB,
  updateCategoryIntoDB,
  deleteCategory
};

