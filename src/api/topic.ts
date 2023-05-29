import { getSearchParams } from 'constants/index';
import { deleteAPI, getAPI, postAPI, putAPI } from './axios';
import { IParamsSearch } from './courses';

export const searchTopics = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/topics${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteTopic = async ({ id }: { id: number }) => {
  try {
    const data = await deleteAPI(`api/topics/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleTopics = async (params: { topicIDs: React.Key[] }) => {
  try {
    const data = await deleteAPI(`api/topics`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const createNewTopic = async (params: { topicName: string; thumbnailPath: string }) => {
  try {
    const data = await postAPI(`api/topics`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const editTopic = async ({
  params,
  id,
}: {
  params: { topicName: string; thumbnailPath: string };
  id: number;
}) => {
  try {
    const data = await putAPI(`api/topics/${id}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getTopicById = async ({ id }: { id: number }) => {
  try {
    const data = await getAPI(`api/topics/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};
