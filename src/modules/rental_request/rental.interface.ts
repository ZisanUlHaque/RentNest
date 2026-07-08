import { RentalRequestStatus } from "../../../generated/prisma/enums";
import { RentalRequestWhereInput } from "../../../generated/prisma/models";

export interface ICreateRentalRequestPayload {
  propertyId: string;
  moveInDate: Date | string;
  durationMonths: number;
  message?: string;
}

export interface IUpdateRentalRequestPayload {
  status: RentalRequestStatus;
}

export interface IRentalRequestQuery extends RentalRequestWhereInput {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: RentalRequestStatus;
}