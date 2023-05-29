import { getSearchParams, InfoType } from 'constants/index';
import React from 'react';
import { deleteAPI, getAPI, postAPI, putAPI } from './axios';

export interface IPramGetCategories {
  limit?: number;
  page?: number;
  search?: string;
  total?: number;
  listRoles: {
    id: number;
    roleName: string;
    accessAssetGroups: {
      id: number;
      groupName: string;
    }[];
  }[];
}

export interface IParamsSearch {
  limit: number;
  page: number;
  search: string;
  filters?: string;
  sort?: string;
  order?: string;
  id?: number;
}

export const deleteRole = async (params: { id: number }) => {
  try {
    const data = await deleteAPI(`/api/user-roles/${params.id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getListCategories = async (params: IParamsSearch) => {
  try {
    const paramsOption = getSearchParams(params);
    const data = await getAPI(`api/course-categories${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCategory = async (params: { categoryName: string }) => {
  try {
    const data = await postAPI(`/api/course-categories`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (params: { id: number; categoryName: string }) => {
  try {
    const data = await putAPI(`/api/course-categories/${params.id}`, {
      categoryName: params.categoryName,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (params: { id: number }) => {
  try {
    const data = await deleteAPI(`/api/course-categories/${params.id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteSelectionCategories = async (params: { categoryIds: React.Key[] }) => {
  try {
    const data = await deleteAPI('/api/course-categories', params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCategoryById = async (params: { id: number }) => {
  try {
    const data = await getAPI(`/api/course-categories/${params.id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getLearningMode = async () => {
  try {
    const data = await getAPI(`api/courses/learning-modes`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCourseType = async () => {
  try {
    const data = await getAPI(`api/courses/course-types`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCourseProgramType = async () => {
  try {
    const data = await getAPI(`api/courses/program-types`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCourseClassType = async () => {
  try {
    const data = await getAPI(`api/courses/class-types`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCourseDetail = async (courseId: number) => {
  try {
    const data = await getAPI(`api/courses/${courseId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCourse = async (params: InfoType) => {
  try {
    const data = await postAPI(`/api/courses`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCourse = async (params: InfoType) => {
  try {
    const data = await putAPI(`/api/courses/${params.courseId}`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCourses = async (params: { id: number }) => {
  try {
    const data = await deleteAPI(`api/courses/${params.id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleCourses = async (params: { courseIds: React.Key[] }) => {
  try {
    const data = await deleteAPI(`api/courses`, params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCourses = async () => {
  try {
    const data = await getAPI(`api/courses/all`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const searchCourses = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/courses${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAllCourses = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/courses/all/class-management${paramsOption ? paramsOption : ''}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAllModule = async () => {
  try {
    const data = await getAPI(`api/modules/all`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAllCoursesStudent = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(`api/courses/get-course-student${paramsOption ? paramsOption : ''}`);
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

export const getCourseModules = async (courseId: number) => {
  try {
    const data = await getAPI(`api/courses/${courseId}/modules`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCourseModule = async ({
  courseId,
  moduleIds,
}: {
  courseId: number;
  moduleIds: string[];
}) => {
  try {
    const data = await putAPI(`api/courses/${courseId}/modules`, { moduleIds });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCourseSessionsByModule = async (courseId: number) => {
  try {
    const data = await getAPI(`/api/courses/${courseId}/sessions-group-by-module`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAllRegistrationField = async ({ courseId }: { courseId: number }) => {
  try {
    const data = await getAPI(`/api/courses/${courseId}/registration-fields`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAllRegistrationFieldTypes = async () => {
  try {
    const data = await getAPI('/api/course-registration-fields/types');
    return data;
  } catch (error) {
    throw error;
  }
};

export const createNewRegistrationField = async (params: {
  label: string;
  type: string;
  listOfValues?: string[];
  required: boolean;
}) => {
  try {
    const data = await postAPI('/api/course-registration-fields', params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteRegistrationById = async ({ id }: { id: number }) => {
  try {
    const data = await deleteAPI(`/api/course-registration-fields/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateRegistrationFieldOfCourse = async ({
  registrationFieldIds,
  courseId,
}: {
  registrationFieldIds: number[];
  courseId: number;
}) => {
  try {
    const data = await putAPI(`/api/courses/${courseId}/registration-fields`, {
      registrationFieldIds,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
