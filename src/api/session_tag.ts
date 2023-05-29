import { getSearchParams } from 'constants/index';
import { getAPI, postAPI } from './axios';
import { IParamsSearch } from './courses';

export interface ISessionTag {
  id: number;
  tagName: string;
}

export const searchSessionTags = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);
  try {
    const data = await getAPI(`api/session-tags${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const createSessionTag = async (body: { tagName: string }) => {
  try {
    const data = await postAPI(`api/session-tags`, body);
    return data;
  } catch (error) {
    throw error;
  }
};
