import { getAPI, postAPI, putAPI, deleteAPI } from './axios';

export interface IDataRequest {
  themeName?: string;
  templateID: number | string;
  themeId?: number | string;
  themeSetups: {
    topMenuBarColor: string;
    searchBarColor: string;
    leftMenuHighlightStripeColor: string;
    leftMenuHighlightColor: string;
    leftMenuFontAndIcon: string;
    leftMenuBarColor: string;
    backgroundColor: string;
    fontColor: string;
    fontFamily: string;
    buttonColor: string;
    leftMenuExtendBackground: string;
  };
}

export interface ITemplateTheme {
  templateName?: string;
  themes?: Array<{
    id: number;
    themeName: string;
    templateID: number;
  }>;
}

export const getTheme = async (themeID: number | null ) => {
  try {
    const data = await getAPI(`api/themes/${themeID}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const createTheme = async (dataRequest: IDataRequest) => {
  try {
    const data = await postAPI('api/themes', dataRequest);
    return data;
  } catch (error) {
    throw error;
  }
};

export const editTheme = async (dataRequest: IDataRequest) => {
  try {
    const data = await putAPI(`api/themes/${dataRequest?.themeId}`, dataRequest);
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteTheme = async (dataRequest: { themeID: number | null }) => {
  try {
    const data = await deleteAPI(`api/themes/${dataRequest?.themeID}`);
    return { ...data, themeID: dataRequest.themeID };
  } catch (error) {
    throw error;
  }
};

export const getAllTemplate = async () => {
  try {
    const data = await getAPI('/api/templates');
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAllTemplateThemes = async (param: { templateID: number | null }) => {
  try {
    const data = await getAPI(`/api/templates/${param.templateID}/themes`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getThemeDefault = async () => {
  try {
    const data = await getAPI('api/templates/common');
    return data;
  } catch (error) {
    throw error;
  }
};
