import { getSearchParams, IAdminInfo, InfoType } from 'constants/index';
import { Moment } from 'moment';
import { deleteAPI, getAPI, postAPI, putAPI } from './axios';
import { IParamsSearch } from './courses';

export interface IAminProfile {
  firstName: string;
  lastName: string;
  username: string;
  ICNumber: string;
  gender: string;
  mobileCountryCode: string;
  contactNumber: string;
  dateOfBirth: Moment;
  nationality: string;
  address1: string;
  address2: string;
  country: string;
  postalCode: string;
  designation: string;
  theme?: string;
  email?: string;
  themeID?: number;
  profilePhotoDestination: string;
  userRoleID?: number;
  centreIDs?: number[];
  remark?: string;
}

export const getAdminDetail = async (courseId: number) => {
  try {
    const data = await getAPI(`api/courses/${courseId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const createAdmin = async (params: IAdminInfo) => {
  try {
    const data = await postAPI(`api/centre-admins`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateAdmin = async (params: InfoType) => {
  try {
    const data = await putAPI(`api/courses/${params.courseId}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCentreAdminProfileFirstLogin = async (param: IAminProfile) => {
  try {
    const data = await putAPI('api/centre-admins/first-login-update', param);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteAdmin = async (params: { id: number }) => {
  try {
    const data = await deleteAPI(`api/centre-admins/${params.id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleAdmins = async (params: { centreAdminIds: React.Key[] }) => {
  try {
    const data = await deleteAPI(`api/centre-admins`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAdmins = async () => {
  try {
    const data = await getAPI(`api/courses/all`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const searchAdmins = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/centre-admins${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const changePasswordFirstLogin = async (param: {
  oldPassword: string;
  newPassword: string;
}) => {
  try {
    const data = await putAPI('api/users/me/password', param);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCentreAdminDetail = async ({ id }: { id: number }) => {
  try {
    const data = await getAPI(`/api/centre-admins/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCentreAdminProfile = async ({
  params,
  id,
}: {
  params: IAminProfile;
  id: number;
}) => {
  try {
    const data = await putAPI(`/api/centre-admins/${id}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const activateCentreAdmin = async ({ isActive, id }: { isActive: boolean; id: number }) => {
  try {
    const data = await putAPI(`/api/centre-admins/${id}/activation`, { isActive });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deactivateCentreAdmin = async ({
  isActive,
  deactivationReason,
  id,
}: {
  isActive: boolean;
  deactivationReason: string;
  id: number;
}) => {
  try {
    const data = await putAPI(`/api/centre-admins/${id}/activation`, {
      isActive,
      deactivationReason,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCentreAdmin = async ({ id }: { id: number }) => {
  try {
    const data = await deleteAPI(`/api/centre-admins/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};
