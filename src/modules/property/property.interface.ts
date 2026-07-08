import { PropertyStatus } from "../../../generated/prisma/enums";
import { PropertyWhereInput } from "../../../generated/prisma/models";

export interface ICreatePropertyPayload {
  title: string;
  description: string;
  categoryId: string;
  rentPerMonth: number;
  location: string;
  amenities?: string[];
  images?: string[];
  status: PropertyStatus;
}

export interface IUpdatePropertyPayload {
  title?: string;
  description?: string;
  categoryId?: string;
  rentPerMonth?: number;
  location?: string;
  amenities?: string[];
  images?: string[];
  status: PropertyStatus;
}

export interface IPropertyQuery extends PropertyWhereInput {
  searchTerm?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  location?: string;
  categoryId?: string;
  minRent?: string;
  maxRent?: string;
  status?: PropertyStatus;
}
