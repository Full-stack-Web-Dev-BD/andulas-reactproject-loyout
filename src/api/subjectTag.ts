import { getSearchParams } from "constants/index";
import { getAPI, postAPI } from "./axios";
import { IParamsSearch } from "./courses";

export const searchSubjectTag = async (params: IParamsSearch) => {
    const paramsOption = getSearchParams(params);
  
    try {
      const data = await getAPI(`api/subject-tags${paramsOption ? paramsOption : ''}`);
      return data;
    } catch (error) {
      throw error;
    }
};

export const createSubjectTag = async (body: {tagName: string}) => {
  try {
    const data = await postAPI(`api/subject-tags`, body);
    return data;
  } catch (error) {
    throw error;
  }
};