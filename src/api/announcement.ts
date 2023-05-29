import { getAPI, postAPI, putAPI } from "./axios";

export interface IParamsSearch {
  limit: number;
  page: number;
  search?: string;
  filters?: string;
  sort?: string;
  order?: string;
  id?: number;
  status?: 'Ongoing' | 'End';
  isCurrent?: boolean;
  isRead? : string | '' | undefined
  }

interface BodyEndAnnouncement{
  id: number[]
}

export interface BodyCreateAnnouncement{
    title?: string
    message?: string
    classes: string[];
    startDate: Date
    endDate: Date
    sendEmail:boolean
}

export const postAnnouncement = async (body: BodyCreateAnnouncement) => {
  try {
    const data = await postAPI(`api/announcement`, body);
    return data;
  } catch (error) {
    throw error;
  }
};

  export const getAnnouncement = async (params: IParamsSearch) => {
    try {
      const data = await getAPI(`api/announcement`, params);
      return data;
    } catch (error) {
      throw error;
    }
  };

  export const readAnnouncement = async (params: number) => {
    try {
      const data = await putAPI(`api/announcement/read/${params}`, params);
      return data;
    } catch (error) {
      throw error;
    }
  };

  export const countAnnouncement = async () => {
    try {
      const data = await getAPI(`api/announcement/count`);
      return data;
    } catch (error) {
      throw error;
    }
  };

  export const endAnnouncement = async (body: BodyEndAnnouncement) => {
    try {
      const data = await putAPI(`api/announcement/close`, body);
      return data;
    } catch (error) {
      throw error;
    }
  };