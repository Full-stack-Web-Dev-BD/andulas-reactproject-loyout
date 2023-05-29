import { getSearchParams, IAdminInfo, InfoType } from 'constants/index';
import { deleteAPI, getAPI, postAPI, putAPI } from './axios';
import { IParamsSearch } from './courses';
import { Moment } from 'moment';

export const searchTeacher = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/teachers${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const searchTeacherOfCentreAdmin = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams({...params, id: ''});

  try {
    const data = await getAPI(`api/centre-admins/${params?.id}/teachers${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

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

export const createTeacher = async (params: IAdminInfo) => {
  try {
    const data = await postAPI(`api/teachers`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const createTeacherOfCentreAdmin = async (params: {params: IAdminInfo, adminId: number}) => {
  try {
    const data = await postAPI(`api/centre-admins/${params?.adminId}/teachers`, params.params);
    return data;
  } catch (error) {
    throw error;
  }
};


export const updateTeacherProfileFirstLogin = async (param: IAminProfile) => {
  try {
    const data = await putAPI('api/teachers/first-login-update', param);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateTeacher = async (params: InfoType) => {
  try {
    const data = await putAPI(`api/courses/${params.courseId}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteTeacher = async (params: { id: number }) => {
  try {
    const data = await deleteAPI(`api/teachers/${params.id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleTeachers = async (params: { teacherIDs: React.Key[] }) => {
  try {
    const data = await deleteAPI(`api/teachers`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteTeacherOfCentreAdmin = async (params: { id: number, adminId: number }) => {
  try {
    const data = await deleteAPI(`api/centre-admins/${params?.adminId}/teachers/${params.id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleTeachersOfCentreAdmin= async (params: { teacherIDs: React.Key[], adminId: number }) => {
  try {
    const data = await deleteAPI(`api/centre-admins/${params?.adminId}/teachers`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getTeachers = async () => {
  try {
    const data = await getAPI(`api/courses/all`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getTeacherDetail = async ({ id }: { id: number }) => {
  try {
    const data = await getAPI(`/api/teachers/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getTeacherDetailOfCentreAdmin = async ({ id, adminId }: { id: number, adminId: number }) => {
  try {
    const data = await getAPI(`/api/centre-admins/${adminId}/teachers/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getTeacherProfileOfCentreAdmin = async ({ id, adminId }: { id: number, adminId: number }) => {
  try {
    const data = await getAPI(`api/centre-admins/${adminId}/teachers/${id}/profile`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateTeacherProfile = async ({
  params,
  id,
}: {
  params: IAminProfile;
  id: number;
}) => {
  try {
    const data = await putAPI(`/api/teachers/${id}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateTeacherProfileOfCentreAdmin = async ({
  params,
  id: teacherId,
  adminId
}: {
  params: IAminProfile;
  id: number;
  adminId: number;
}) => {
  try {
    const data = await putAPI(`/api/centre-admins/${adminId}/teachers/${teacherId}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const activateTeacher = async ({ isActive, id }: { isActive: boolean; id: number }) => {
  try {
    const data = await putAPI(`/api/teachers/${id}/activation`, { isActive });
    return data;
  } catch (error) {
    throw error;
  }
};

export const activateTeacherOfCentreAdmin = async ({ isActive, id, adminId}: { isActive: boolean; id: number, adminId: number }) => {
  try {
    const data = await putAPI(`/api/centre-admins/${adminId}/teachers/${id}/activation`, { isActive });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deactivateTeacher = async ({
  isActive,
  deactivationReason,
  id,
}: {
  isActive: boolean;
  deactivationReason: string;
  id: number;
}) => {
  try {
    const data = await putAPI(`/api/teachers/${id}/activation`, {
      isActive,
      deactivationReason,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deactivateTeacherOfCentreAdmin = async ({
  isActive,
  deactivationReason,
  id,
  adminId
}: {
  isActive: boolean;
  deactivationReason: string;
  id: number;
  adminId: number;
}) => {
  try {
    const data = await putAPI(`/api/centre-admins/${adminId}/teachers/${id}/activation`, {
      isActive,
      deactivationReason,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteTeacherTab = async ({ id }: { id: number }) => {
  try {
    const data = await deleteAPI(`/api/teachers/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getTeacherCourse = async ({
  params,
  teacherId,
}: {
  params: IParamsSearch;
  teacherId: number;
}) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(
      `api/teachers/${teacherId}/classes${paramsOption ? paramsOption : ''}`,
    );
    return data;
  } catch (error) {
    throw error;
  }
};

export const getTeacherCourseOfCentreAdmin = async ({
  params,
  teacherId,
  adminId
}: {
  params: IParamsSearch;
  teacherId: number;
  adminId: number
}) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(
      `api/centre-admins/${adminId}/teachers/${teacherId}/classes${paramsOption ? paramsOption : ''}`,
    );
    return data;
  } catch (error) {
    throw error;
  }
};
