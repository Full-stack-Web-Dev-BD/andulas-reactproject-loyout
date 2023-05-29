import { getSearchParams } from 'constants/index';
import { ContentType } from 'pages/admin/content-management/session/add-content-session/CreateUnit/Content';
import { Key } from 'react';
import { deleteAPI, getAPI, postAPI, putAPI } from './axios';
import { IParamsSearch } from './courses';

export enum UnitType {
    CONTENT = 'Content',
    WEB_CONTENT = 'Web Content',
    VIDEO = 'Video',
    AUDIO = 'Audio',
    DOCUMENT = 'Document',
    SCORM_XAPI_CMI5 = 'SCORM | xAPI | cmi5',
    FRAME = 'Frame',
    TEST = 'Test',
    SURVEY = 'Survey',
    ASSIGNMENT = 'Assignment',
    INSTRUCTOR_LED_TRAINING = 'Instructor-led training',
    SECTION = 'Section',
}

export interface ANSWER {
    isCorrect: boolean;
    title: string;
    value: string;
    id?: number;
    contentID?: number;
    isContain?: boolean;
    point?: number;
    order?: number;
}

export interface IUserUnit {
    unitID?: number;
    userID?: number;
    score?: number
    attempNumber?: number;
    isPassed?: boolean;
    isCompleted?: boolean;
    startTime?: Date;
    endTime?: Date;
    finishedTime?: Date;
    savedData?: string;
}

export const searchUnits = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: string;
    sort?: string;
    order?: string;
}) => {
    const paramsOption = getSearchParams(params);
    try {
        const data = await getAPI(`api/unit${paramsOption ? paramsOption : ''}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const getAllUnits = async (params: {
    search?: string;
    filters?: string;
    sort?: string;
    order?: string;
}) => {
    const paramsOption = getSearchParams(params);
    try {
        const data = await getAPI(`api/unit/all${paramsOption ? paramsOption : ''}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const createNewUnit = async (params: {
    unitName: string;
    sessionID: number;
    isUploadedFile: boolean;
    filePath: string;
    isDisabled: boolean;
    unitType?: UnitType;
}) => {
    try {
        const data = await postAPI(`api/unit`, params);
        return data;
    } catch (error) {
        throw error;
    }
};

export const updateUnit = async ({
    params,
    unitId,
}: {
    params: {
        unitName: string;
        sessionID: number;
        isUploadedFile: boolean;
        filePath: string;
        isDisabled: boolean;
        unitType?: UnitType;
    };
    unitId: number;
}) => {
    try {
        const data = await putAPI(`api/unit/${unitId}`, params);
        return data;
    } catch (error) {
        throw error;
    }
};

export const getUnitById = async (unitID: number) => {
    try {
        const data = await getAPI(`api/unit/${unitID}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteUnit = async (unitID: number) => {
    try {
        const data = await deleteAPI(`api/unit/${unitID}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const createMultipleUnit = async ({
    sessionID,
    params,
}: {
    sessionID: number,
    params: any[],
}) => {
    try {
        const data = await postAPI(`api/unit/multiple/${sessionID}`, params);
        return data;
    } catch (error) {
        throw error;
    }
};


//Content
export const getContentDetail = async (id: number) => {
    try {
        const data = await getAPI(`api/content/${id}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteContentById = async (id: number) => {
    try {
        const data = await deleteAPI(`api/content/${id}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const createNewContent = async (params: any) => {
    try {
        const data = await postAPI(`api/content`, params);
        return data;
    } catch (error) {
        throw error;
    }
};

export const updateContentById = async (params: {
    id: number,
    data: any,
}) => {
    try {
        const data = await putAPI(`api/content/${params.id}`, params.data);
        return data;
    } catch (error) {
        throw error;
    }
};

export const updateAnswers = async ({
    params,
    contentID,
}: {
    params: ANSWER[];
    contentID: number;
}) => {
    try {
        const data = await postAPI(`api/answer/${contentID}`, params);
        return data;
    } catch (error) {
        throw error;
    }
};

export const scrapeContent = async (params: {
    url: string;
}) => {
    try {
        const data = await postAPI(`api/unit/scrapper`, params);
        return data;
    } catch (error) {
        throw error;
    }
};

export const getAllQuestions = async (params: {
    limit?: number;
    search?: string;
    filters?: string;
    sort?: string;
    order?: string;
}) => {
    const paramsOption = getSearchParams(params);
    try {
        const data = await getAPI(`api/content/questions${paramsOption ? paramsOption : ''}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const getQuestionsNotRandomized = async (params: {
    limit?: number;
    page?: number;
    search?: string;
    filters?: string;
    sort?: string;
    order?: string;
    id?: number;
}) => {
    const paramsOption = getSearchParams(params);
    try {
        const data = await getAPI(`api/content/questions/randomized${paramsOption ? paramsOption : ''}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const getQuestionsTest = async (params: {
    limit?: number;
    page?: number;
    search?: string;
    filters?: string;
    sort?: string;
    order?: string;
    id?: number;
}) => {
    const paramsOption = getSearchParams(params);
    try {
        const data = await getAPI(`api/content/questions/test${paramsOption ? paramsOption : ''}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const getFileUrlNotExpire = async (filePath: string) => {
    try {
        const data = await getAPI(`api/file-url/not-expire?filePath=${filePath}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const saveUserUnits = async (params: {
    unitID: number,
    data: IUserUnit,
}) => {
    try {
        const data = await postAPI(`api/unit/user-units/${params.unitID}`, params.data);
        return data;
    } catch (error) {
        throw error;
    }
};

export const saveUserUnitsStudent = async (params: {
    unitID: number,
    data: IUserUnit,
}) => {
    try {
        const data = await postAPI(`api/unit/user-units/student/${params.unitID}`, params.data);
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteUserUnitsByUnitID = async (params: {
    unitID: number,
    data: {
        userID: number;
    },
}) => {
    try {
        const data = await postAPI(`api/unit/user-units/delete-by-unit-id/${params.unitID}`, params.data);
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteUserUnitsByClassIDAndUserID = async (params: {
    classID: number,
    data: {
        userID: number;
    },
}) => {
    try {
        const data = await postAPI(`api/unit/user-units/delete-all-by-class-id-user-id/${params.classID}`, params.data);
        return data;
    } catch (error) {
        throw error;
    }
};

export const completeStudentUserUnits = async (params: {
    userID: number,
    classID: number,
    enrolledOn: any,
    completedOn: any,
}) => {
    try {
        const data = await postAPI(`api/unit/user-units/complete-student`, params);
        return data;
    } catch (error) {
        throw error;
    }
};

export const getQuestionsTestByIds = async (params: {
    Ids?: string;
}) => {
    const paramsOption = getSearchParams(params);
    try {
        const data = await getAPI(`api/content/questions/test/ids${paramsOption ? paramsOption : ''}`);
        return data;
    } catch (error) {
        throw error;
    }
};
