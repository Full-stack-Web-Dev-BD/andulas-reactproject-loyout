import { IClass } from 'api/class';
import { Moment } from 'moment';
import { KeyboardEvent, ReactElement } from 'react';

export interface IResponse {
  data?: object | string[];
  isSuccess?: boolean;
  message?: string;
  statusCode?: number;
}

export interface IMenuAccess {
  id: number;
  menuName: string;
  menuChildren: Array<IMenuAccess>;
  menuParentID: number;
  createdAt: string;
  resourcePath: string;
  selected: boolean;
  templateID: number;
  updatedAt: string;
}

export interface IAccessControl {
  id: number;
  accessControls: Array<IAccessControlItem>;
  groupName: string;
  selected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAccessControlItem {
  id: number;
  accessControlName: string;
  assetControlGroupID: number;
  selected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IMenuSideBar {
  label: string;
  icon: ReactElement | null;
  path: string;
  key?: string | number;
  children: Array<IMenuSideBar> | null;
}

export interface IFieldListForm {
  label: string;
  rows?: number;
  isHidden?: boolean;
  rules?: any;
  name: string;
  nameChild?: string[];
  type: string;
  options?: Array<{ label: string; value: string }>;
  isFullWidth?: boolean;
  classNameCustom?: string;
  value?: any;
  isMultiple?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  handleSearch?: (val: string) => void;
  onKeyPress?: (event: KeyboardEvent<HTMLDivElement>) => void;
  isClearSearchValue?: boolean;
  onChange?: (value: any) => void;
  placeholder?: string;
}

export interface IOptionItem {
  label: string;
  value: string;
  isDisabled: boolean;
}

export interface ICategory {
  id: number;
  categoryName: string;
}

export interface IModule {
  id: number;
  moduleName: string;
  moduleCode: string;
}

export interface ITopic {
  id: number;
  topicName: string;
}

export interface ISession {
  id: number;
  sessionName: string;
  status: string;
  authorID: number;
  category: {
    id: number;
    categoryName: string;
  };
  module: {
    id: number;
    moduleName: string;
    moduleCode?: string;
    topic: {
      id: number;
      topicName: string;
    };
  };
  classSessions: { teachers: any[]; id: number }[];
  order?: number;
}

export interface ISessionTime {
  id?: number;
  startTime?: Date;
  endTime?: Date;
  sessionID: number;
  session?: ISession;
  classID: number
  class: IClass;
}

export interface InfoType {
  courseName?: string;
  category?: { label: string; value: string };
  courseCategoryID?: string | number;
  learningMode?: string;
  learningMethod?: string;
  classType?: string;
  capacity?: number;
  maximumClass?: number;
  programType?: string;
  duration?: Array<Moment>;
  isActive?: boolean;
  courseType?: string;
  description?: string;
  catalogImage?: string;
  catalogImageUrl?: string;
  startDate?: string;
  endDate?: string;
  courseId?: number;
  id?: number | string;
  courseCategory?: {
    id: number;
    categoryName: string;
  };
  classes?: IClass[];
}

export interface IAdminInfo {
  lastName: string;
  firstName: string;
  email: string;
  userRoleID?: number;
  centreIDs?: number[];
  role?: { value: string };
  centre?: { value: string }[];
  remark?: string;
  designation: string;
  subjectTagIDs?: number[];
  subjectTag?: { value: string }[];
}

export interface IAdminProfile {
  isActive: boolean;
  isUpdatedProfile: boolean;
  remark: string;
  deactivationReason?: string;
  createdAt: string;
  user: {
    id: number;
    userProfile: {
      ICNumber: string;
      address1: string;
      address2: string;
      contactNumber: string;
      country: string;
      dateOfBirth: string;
      firstName: string;
      lastName: string;
      gender: string;
      nationality: string;
      postalCode: string;
      mobileCountryCode: string;
      designation: string;
      profilePhotoDestination: string;
    };
    userRole: {
      roleName: string;
      id: number;
    };
    email: string;
    lastLogin: string;
    username: string;
  };
  centres: {
    id: number;
    centreName: string;
  }[];
  subjectTags?: {
    id: number;
    tagName: string;
  }[];
}

export interface IStudentProfile {
  isActive: boolean;
  isUpdatedProfile: boolean;
  remark: string;
  deactivationReason?: string;
  createdAt: string;
  user: {
    id: number;
    userProfile: {
      ICNumber: string;
      address1: string;
      address2: string;
      contactNumber: string;
      country: string;
      dateOfBirth: string;
      firstName: string;
      lastName: string;
      gender: string;
      nationality: string;
      postalCode: string;
      mobileCountryCode: string;
      designation: string;
      profilePhotoDestination: string;
    };
    userRole: {
      roleName: string;
      id: number;
    };
    email: string;
    lastLogin: string;
    username: string;
  };
  centres: {
    id: number;
    centreName: string;
  }[];
}

export interface ITopic {
  id: number;
  topicName: string;
}

export interface ISessionDetail {
  id: number;
  author: {
    userProfile: {
      firstName: string;
      lastName: string;
    };
  };
  category: {
    id: number;
    categoryName: string;
  };
  classes: { id: number; className: string; courseName: string; isActive: boolean }[];
  contentAttachedPath: string;
  module: {
    id: number;
    moduleName: string;
    moduleCode?: string;
    topic: {
      id: number;
      topicName: string;
    };
  };
  updatedAt: string;
  programType: string;
  sessionDetails: string;
  sessionName: string;
  sessionType: string;
  status: string;
  tags: { id: number; tagName: string }[];
  excludedFromCourses: [];
  authorization: string;
  authorID?: number;
  order: number;
}

export interface ISessionClassModule {
  id: number;
  sessionName: string;
  startTime: string;
  endTime: string;
  firstNameTeacher: string;
  lastNameTeacher: string;
  status: string;
  completedPercent: number;
  completed: number;
}

export interface IListCourse {
  limit?: number | string;
  order?: 'ASC' | 'DESC';
  page?: number;
  sort?: string;
  total?: number;
  listCourses: InfoType[];
}

export interface IListModule {
  limit?: number | string;
  order?: 'ASC' | 'DESC';
  page?: number;
  sort?: string;
  total?: number;
  listModules: IModule[];
  students?: number;
  classDetail?: IClass;
}

export interface IListSession {
  limit?: number | string;
  order?: 'ASC' | 'DESC';
  page?: number;
  sort?: string;
  total?: number;
  records: ISession[];
  students?: number;
}

export interface IListSessionTime {
  limit?: number | string;
  order?: 'ASC' | 'DESC';
  page?: number;
  sort?: string;
  total?: number;
  records: ISessionTime[];
  students?: number;
}

export interface IClassStudent {
  id: number;
  studentID: number;
  classID: number;
  student: {
    id: number;
    user: {
      id: number;
      userProfile: {
        firstName: string;
        lastName: string;
      }
    }
  }
}

export interface IListClassStudent {
  students: IClassStudent[];
  totalStudents: number;
}

export interface IAttendance {
  id?: number;
  classSessionId: number;
  attendanceDate: Date;
  studentId: number;
  isAttendance: boolean;
}