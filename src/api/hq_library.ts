import { getSearchParams } from 'constants/function';
import { deleteAPI, getAPI, postAPI, putAPI } from './axios';

export interface IParamsSearch {
  limit: number;
  page: number;
  search: string;
  filters?: string;
  sort?: string;
  order?: string;
  id?: number;
}

export const getListTopics = async (params: IParamsSearch) => {
  try {
    const paramsOption = getSearchParams(params);
    const data = await getAPI(`api/topics${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const searchModules = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/modules${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteModule = async (params: { id: number }) => {
  try {
    const data = await deleteAPI(`api/modules/${params.id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleModules = async (params: { moduleIDs: React.Key[] }) => {
  try {
    const data = await deleteAPI(`api/modules`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const createNewModule = async ({
  topicID,
  moduleName,
}: {
  topicID: number;
  moduleName: string;
}) => {
  try {
    const data = await postAPI(`api/modules`, { moduleName, topicID });
    return data;
  } catch (error) {
    throw error;
  }
};

export const duplicateNewModule = async ({
  topicID,
  moduleID,
}: {
  topicID: number;
  moduleID: number;
}) => {
  try {
    const data = await postAPI(`/api/modules/${moduleID}/duplicate`, { topicID });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateModule = async ({ id, moduleName }: { id: number; moduleName: string }) => {
  try {
    const data = await putAPI(`api/modules/${id}`, { moduleName });
    return data;
  } catch (error) {
    throw error;
  }
};
