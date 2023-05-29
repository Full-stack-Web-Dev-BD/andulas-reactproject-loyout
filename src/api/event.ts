import { IEvent } from 'pages/admin/calendar/constants';
import { deleteAPI, getAPI, postAPI, putAPI } from './axios';

export const createEvent = async (params: IEvent) => {
  try {
    const data = await postAPI('/api/events', params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAllEvent = async (params: { search?: string; id?: string }) => {
  try {
    const data = await getAPI('/api/events', params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateEvent = async (params: IEvent) => {
  try {
    const data = await putAPI(`/api/events/${params.id}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteEvent = async (id: number) => {
  try {
    const data = await deleteAPI(`/api/events/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};
