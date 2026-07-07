import { prisma } from "../../lib/prisma";
import { IcraeteCategory } from "./category.interface";

const createCategoryIntoDB = async (payload: IcraeteCategory) => {
  const { name, description } = payload;
  const isCategoryExist = await prisma.category.findUnique({
    where: { name },
  });

  if (isCategoryExist) {
    throw new Error("Category with this name already exists");
  }

  const createCategory = await prisma.category.create({
    data : {
        name,
        description
    }
  })

  const category =await prisma.category.findUnique({
    where : {
        id: createCategory.id,
        name : createCategory.name,
    }
  })

  return category
};



export const categoryService = {
    createCategoryIntoDB
}