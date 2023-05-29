import { getSearchParams } from 'constants/index';
import { Key } from 'react';
import { deleteAPI, getAPI, postAPI, putAPI } from './axios';
import { IParamsSearch } from './courses';

export const getTime = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/sessions/time${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const searchSessions = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/sessions${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAllSessionByClassModule = async (params: {
  limit?: number;
  page?: number;
  search?: string;
  filters?: string;
  sort?: string;
  order?: string;
  id?: number;
}) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/sessions/get-session-by-classModule${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const duplicateSession = async (params: { sessionId: number; moduleId: number }) => {
  try {
    const data = await postAPI(`api/sessions/${params.sessionId}/duplicate`, {
      moduleID: params?.moduleId,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteSession = async (sessionId: number) => {
  try {
    const data = await deleteAPI(`api/sessions/${sessionId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleSessions = async (params: { sessionIDs: Key[] }) => {
  try {
    const data = await deleteAPI(`api/sessions`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const createNewSession = async (params: {
  sessionName: string;
  moduleID: number;
  categoryID?: number;
  status?: string;
  sessionDetails?: string;
  programType?: string;
  sessionType?: string;
  tagIds?: number[];
  contentAttachedUrl?: string;
}) => {
  try {
    const data = await postAPI(`api/sessions`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateSession = async ({
  params,
  sessionID,
}: {
  params: {
    sessionName: string;
    moduleID: number;
    categoryID?: number;
    status?: string;
    sessionDetails?: string;
    programType?: string;
    sessionType?: string;
    tagIds?: number[];
    contentAttachedUrl?: string;
  };
  sessionID: number;
}) => {
  try {
    const data = await putAPI(`api/sessions/${sessionID}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getSessionDetail = async (sessionId: number) => {
  try {
    const data = await getAPI(`api/sessions/${sessionId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const unAssignSession = async (params: { sessionId: number; classID: number }) => {
  try {
    const data = await putAPI(`api/sessions/${params.sessionId}/unassign`, {
      classID: params.classID,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getSessionById = async (sessionID: number) => {
  try {
    const data = await getAPI(`api/sessions/${sessionID}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const reorderSession = async (params: Array<{ id: number; order: number }>) => {
  try {
    const data = await postAPI(`api/sessions/reorder`, {
      data: params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
