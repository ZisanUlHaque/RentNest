import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { categoryService } from "./category.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const category = await categoryService.createCategoryIntoDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Category created successfully",
    data: {
      category,
    },
  });
});

const getAllCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await categoryService.getCategoryFromDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category Retrieved Successfully",
      data: result,
    });
  },
);

const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params.categoryId;

    if (!categoryId) {
      throw new Error("Category Id Required In Params");
    }

    const payload = req.body;

    const result = await categoryService.updateCategoryIntoDB(
      categoryId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category updated successfully",
      data: result,
    });
  },
);

const deleteCategory = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const categoryId = req.params.categoryId;
    if (!categoryId) {
        throw new Error("Category Id Required In Params")
    }

    await categoryService.deleteCategory(categoryId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category deleted successfully",
        data: null
    })
})

export const categoryContoller = {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory
};
