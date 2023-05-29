import { Moment } from 'moment';
import { deleteAPI, getAPI, postAPI, putAPI } from './axios';
import { getSearchParams } from 'constants/index';
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

export const getAttendance = async ({
  classSessionId,
  attendanceDate,
}: {
  classSessionId: number;
  attendanceDate: Date;
}) => {
  try {
    const data = await getAPI(
      `/api/students/attendance?classSessionId=${classSessionId}&attendanceDate=${attendanceDate}`,
    );
    return data;
  } catch (error) {
    throw error;
  }
};

export const changeAttendance = async ({
  classSessionId,
  attendanceDate,
  studentId,
}: {
  classSessionId: number;
  attendanceDate: Date;
  studentId: number;
}) => {
  try {
    const data = await postAPI(`/api/students/attendance`, {
      classSessionId,
      attendanceDate,
      studentId,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const uploadAvatarRegister = async ({ formData }: { formData: FormData }) => {
  try {
    const data = await postAPI(`/api/upload-image`, formData);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getStudentDetailById = async ({ id }: { id: number }) => {
  try {
    const data = await getAPI(`/api/students/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getStudentProfile = async ({ id }: { id: number }) => {
  try {
    const data = await getAPI(`/api/students/${id}/profile`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateStudentProfile = async ({
  params,
  id,
}: {
  params: IAminProfile;
  id: number;
}) => {
  try {
    const data = await putAPI(`/api/students/${id}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const activateStudent = async ({ isActive, id }: { isActive: boolean; id: number }) => {
  try {
    const data = await putAPI(`/api/students/${id}/activation`, { isActive });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deactivateStudent = async ({
  isActive,
  deactivationReason,
  id,
}: {
  isActive: boolean;
  deactivationReason: string;
  id: number;
}) => {
  try {
    const data = await putAPI(`/api/students/${id}/activation`, {
      isActive,
      deactivationReason,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteStudent = async ({ id }: { id: number }) => {
  try {
    const data = await deleteAPI(`/api/students/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const searchStudent = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/students${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleStudents = async (params: { studentIDs: React.Key[] }) => {
  try {
    const data = await deleteAPI(`api/students`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getStudentCourse = async ({
  params,
  studentId,
}: {
  params: IParamsSearch;
  studentId: number;
}) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(
      `api/students/${studentId}/classes${paramsOption ? paramsOption : ''}`,
    );
    return data;
  } catch (error) {
    throw error;
  }
};

export const searchStudentClassManagement = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);
  try {
    const data = await getAPI(`api/students/class-management${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getStudentDetailByIdClassManagement = async ({ id, params }: {
  id: number,
  params: {
    filters?: string;
  }
}) => {
  const paramsOption = getSearchParams(params);
  try {
    const data = await getAPI(`/api/students/class-management/${id}${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const countStudentResetableClassManagement = async ({ classID }: {
  classID: number,
}) => {
  try {
    const data = await getAPI(`/api/students/class-management/count-resetable-student`, {
      classID,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const countStudentSynchronizableClassManagement = async ({ classID, isNotCompleted }: {
  classID: number,
  isNotCompleted?: boolean,
}) => {
  try {
    const data = await getAPI(`/api/students/class-management/count-synchronizable-student`, {
      classID,
      isNotCompleted,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const resetAllUserUnitByClassID = async (params: {
  classID: number,
}) => {
  try {
    const data = await postAPI(`api/unit/user-units/reset-all-by-class-id`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const exportCSVClassManagementStudentList = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);
  try {
    const data = await getAPI(`api/students/class-management/export-csv${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};
