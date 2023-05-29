import { getSearchParams } from 'constants/index';
import { getAPI } from './axios';
import { IParamsSearch } from './courses';

export const getModuleByClass = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/modules/class/${params.id}${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
}

export const searchModules = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/modules${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getModuleById = async (id: number) => {
  try {
    const data = await getAPI(`api/modules/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};
