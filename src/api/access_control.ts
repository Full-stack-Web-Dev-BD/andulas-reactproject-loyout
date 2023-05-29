import { getSearchParams } from 'constants/index';
import { deleteAPI, getAPI, postAPI, putAPI } from './axios';
import { IParamsSearch } from './courses';

export interface IPramGetRole {
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
    accessControls: any;
  }[];
}

export const createNewRole = async (params: { roleName: string; templateID: number }) => {
  try {
    const data = await postAPI('/api/user-roles', params);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteRole = async (params: { id: number }) => {
  try {
    const data = await deleteAPI(`/api/user-roles/${params.id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getListRoles = async (params: {
  limit?: number;
  page?: number;
  search?: string;
  filter?: string;
}) => {
  
  try {
    const data = await getAPI(
      `api/user-roles?limit=${params.limit}&page=${params.page || 1}${params.search ? `&search=${params.search}`: ''}${
        params?.filter
          ? `&filters=${JSON.stringify([{ templateID: parseInt(params.filter as string) }])}`
          : ''
      }`,
    );
    return data;
  } catch (error) {
    throw error;
  }
};

export const getListRolesAdmin = async (params: IParamsSearch) => {
  const paramsOption = getSearchParams(params);

  try {
    const data = await getAPI(
      `api/user-roles${paramsOption ? paramsOption : ''}`,
    );
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAccessMenus = async (roleId: number) => {
  try {
    const data = await getAPI(`api/user-roles/${roleId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAccessControls = async (roleId: number) => {
  try {
    const data = await getAPI(`api/access-control-groups/${roleId}/get-template`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateMenuSideBar = async (dataRequest: {
  sidebarMenuIds: Array<number>;
  roleId: number;
}) => {
  try {
    const data = await putAPI(`api/user-roles/${dataRequest.roleId}/sidebar-menus`, {
      sidebarMenuIds: dataRequest.sidebarMenuIds,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateAccessControls = async (dataRequest: {
  accessControlIds: Array<number>;
  roleId: number;
}) => {
  try {
    const data = await putAPI(`api/user-roles/${dataRequest.roleId}/access-controls`, {
      accessControlIds: dataRequest.accessControlIds,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
