import { getSearchParams } from 'constants/function';
import { getAPI, putAPI } from './axios';

export const getManageAcceptanceByAdmission = async (params: {
  limit?: number;
  page?: number;
  search?: string;
  filters?: string;
  sort: string;
  order: string;
}) => {
  try {
    const paramsOption = getSearchParams(params);
    const data = await getAPI(`/api/course-registrations${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getRegistrationById = async ({ id }: { id: number }) => {
  try {
    const data = await getAPI(`/api/course-registrations/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateRegistrationStatus = async ({
  id,
  status,
  reason,
}: {
  id: number;
  status: string;
  reason?: string;
}) => {
  try {
    const data = await putAPI(`/api/course-registrations/${id}/status`, {
      status: status,
      reason: reason,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateRegistrationSelection = async ({
  status,
  listRegistrationIds,
  reason,
}: {
  status: string;
  listRegistrationIds?: number[];
  reason?: string;
}) => {
  try {
    const data = await putAPI(`/api/course-registrations/status/bulk-update`, {
      status: status,
      listRegistrationIds: listRegistrationIds,
      reason: reason,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAllRegistrationStatus = async () => {
  try {
    const data = await getAPI(`/api/course-registrations/statuses`);
    return data;
  } catch (error) {
    throw error;
  }
};
