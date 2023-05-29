import { IAminProfile } from './admin';
import { getAPI, postAPI, putAPI } from './axios';
import { IParamsSearch } from './courses';

export interface IUser {
  username?: string;
  email?: string;
  password?: string;
  themeID?: number;
  userProfile?: {
    firstName: string;
    lastName: string;
    contactNumber: string;
    salutation: string;
    gender: string;
    languageID: number;
    mobileCountryCode: string;
    dateOfBirth: string;
    designation?: string;
    ICNumber: string;
    nationality: string;
    postalCode: string;
    address1: string;
    address2: string;
    country: string;
    profilePhotoDestination: string;
  };
  userRole?: {
    roleName: string;
    templateID: number;
    sidebarMenus: Array<{
      menuName: string;
      id: number;
    }>;
  };
  commonTemplate?: {
    templateSetups: {
      logoUrl: string;
    };
  };
  theme?: {
    id: number;
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
  };
  centreAdmin?: {
    id: number;
    isUpdatedProfile: boolean;
    isChangedPassword: boolean;
    centres: { centreName: string; id: number }[];
  };
  teacher?: {
    id: number;
    isUpdatedProfile: boolean;
    isChangedPassword: boolean;
    isActive: boolean;
  };
  id?: number;
}
export interface ISendOtp {
  actionType: string;
  twoFactorAuthenticationMethod: string;
  usernameOrEmail: string;
  successUrl?: string;
  failureUrl?: string;
}

export const login = async ({
  usernameOrEmail,
  password,
}: {
  usernameOrEmail: string;
  password: string;
}) => {
  try {
    const data = await postAPI('/api/auth/login', { usernameOrEmail, password });
    return data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (param: IUser | unknown) => {
  try {
    const { data } = await postAPI('/api/auth/signup', param);
    return data;
  } catch (error: any) {
    throw error.response.data.message;
  }
};

export const sendOtp = async (param: ISendOtp | unknown) => {
  try {
    const data = await postAPI('/api/auth/send-otp', param);
    return data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (param: { otp: string; actionType: string }) => {
  try {
    const data = await postAPI('/api/auth/verify-otp', param);
    return data;
  } catch (error) {
    throw error;
  }
};

export const newPassword = async (param: { token: string | null; password: string }) => {
  try {
    const data = await postAPI('/api/auth/create-new-password', param);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getProfileMe = async () => {
  try {
    const data = await getAPI('/api/users/me');
    return data;
  } catch (error) {
    throw error;
  }
};

export const getProfileUser = async (id?: number) => {
  try {
    const data = await getAPI(`/api/users/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getProfileTeacher = async (id?: number) => {
  try {
    const data = await getAPI(`/api/teachers/${id}/profile`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateProfileMe = async (param: IAminProfile) => {
  try {
    const data = await putAPI('/api/users/me', param);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateNewEmail = async (param: { newEmail?: string; otp?: string }) => {
  try {
    const data = await putAPI('api/users/me/email', param);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateNewContactNumber = async (param: {newMobileCountryCode?: string, otp?: string, newContactNumber?: string}) => {
  try {
    const data = await putAPI('api/users/me/contact-number', param);
    return data;
  } catch (error) {
    throw error;
  }
};

export const uploadFileImage = async (formData: FormData) => {
  try {
    const data = await postAPI(`api/upload-file`, formData);
    return data;
  } catch (error) {
    throw error;
  }
};

export const uploadAvatar = async ({
  formData,
  userId,
}: {
  formData: FormData;
  userId: number;
}) => {
  try {
    const data = await postAPI(`api/users/${userId}/avatar`, formData);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getFileUrl = async (filePath: string) => {
  try {
    const data = await getAPI(`api/file-url?filePath=${filePath}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateTwoFactor = async (params: {
  newIs2FAEnabled: boolean;
  new2FAMethod: string;
  otp?: string;
}) => {
  try {
    const data = await putAPI('/api/users/me/2fa-method', params);
    return data;
  } catch (error) {
    throw error;
  }
};
