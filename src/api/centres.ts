import { getSearchParams } from "constants/index";
import { getAPI } from "./axios";
import { IParamsSearch } from "./courses";

export const searchCentres = async (params: IParamsSearch) => {
    const paramsOption = getSearchParams(params);
  
    try {
      const data = await getAPI(`api/centres${paramsOption ? paramsOption : ''}`);
      return data;
    } catch (error) {
      throw error;
    }
};

export const searchCentresOfAdmin = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams({...params, id: ''});

  try {
    const data = await getAPI(`api/centre-admins/${params?.id}/centres${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};