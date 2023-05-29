import { getSearchParams } from 'constants/index';
import { deleteAPI, getAPI, postAPI, putAPI } from './axios';
import { IParamsSearch } from './courses';

export interface IClass {
  id?: number;
  className: string;
  capacity: number;
  centreID: number;
  courseID: number;
  startDate: string;
  endDate: string;
  classSessions?: {
    teacherIDs?: number[] | string[];
    sessionID?: string | number;
    centreID?: string | number;
    classroomID?: string | number;
    startTime?: string | undefined;
    endTime?: string | undefined;
  }[];
}

export interface IParamValidationSession {
  sessionID: number;
  teacherIDs: number[];
  classroomID?: number;
  startTime: string;
  endTime: string;
}

export const getStudents = async (id: number) => {
  try {
    const data = await getAPI(`api/classes/${id}/students`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const searchClass = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/classes${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const searchClassRoom = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/classrooms${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getClassById = async (classId: number) => {
  try {
    const data = await getAPI(`api/classes/${classId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteClass = async (params: { id: number }) => {
  try {
    const data = await deleteAPI(`api/classes/${params.id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleClass = async (params: { listClassIds: React.Key[] }) => {
  try {
    const data = await deleteAPI(`api/classes`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const createMultipleClass = async (body: IClass[]) => {
  try {
    const data = await postAPI(`api/classes/bulk-create`, { classes: body });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateClass = async (body: { data: IClass[]; classId: number }) => {
  try {
    const data = await putAPI(`api/classes/${body.classId}`, body.data[0]);
    return data;
  } catch (error) {
    throw error;
  }
};

export const checkValidationSession = async (params: IParamValidationSession[]) => {
  try {
    const data = await postAPI(`api/classes/check-assigned-sessions`, { classSessions: params });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAnnnoucementInClass = async (classId: number) => {
  try {
    const data = await getAPI(`api/classes/${classId}/announcement`);
    return data;
  } catch (error) {
    throw error;
  }
};