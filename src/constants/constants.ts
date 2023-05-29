export const ACTION_TYPE = {
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  TWO_FACTOR_AUTHENTICATION: 'TWO_FACTOR_AUTHENTICATION',
};

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  courses: '/courses',
  student: '/student',
  manage_student: '/student/manage-student',
  student_detail: '/student/manage-student/student',
  teacher: '/teacher',
  teacher_detail: '/teacher/manage-teacher/teacher',
  admin: '/admin',
  manage_admin: '/admin/manage-admin',
  report_admin: '/admin/report',
  calendar: '/calendar',
  announcement: '/announcement',
  new_announcement: '/announcement/new-announcement',
  my_driver: '/my-drive',
  trash_drive: '/my-drive/trash-drive',
  hq_library: '/hq-library',
  community_library: '/community-library',
  content_management: '/content-management',
  access_control: '/access-control',
  search: '/search',
  setting: '/settings',
  setting_themes: '/settings/themes',
  profile_me: '/profile/me',
  profile: '/profile',
  guide: '/guide',
  letters: '/letters',
  reports: '/reports',
  manage_class: '/courses/manage/manage-class',
  manage_course: '/courses/manage/manage-course',
  new_manage_class: '/courses/manage/manage-class/class',
  category: '/courses/category',
  update_category: '/courses/category/category-update',
  course_detail: '/courses/manage/manage-course/course',
  manage_acceptance: '/courses/manage-acceptance',
  my_course: '/courses/my-course',
  my_course_detail: '/courses/my-course/detail',
  by_admission: '/courses/manage-acceptance/by-admission',
  manage_acceptance_update: '/courses/manage-acceptance-update',
  auto_enrolled: '/courses/manage-acceptance/auto-enrolled',
  admin_detail: '/admin/manage-admin/admin',
  profile_admin_login_first_time: '/admin/profile',
  profile_teacher_login_first_time: '/teacher/profile',
  new_password: '/create-new-password',
  profile_change_password: '/profile/change-password',
  view_as: '/view-as',
  hq_library_topic: '/hq-library/topic',
  hq_library_module: '/hq-library/module',
  module_session: '/hq-library/module/session',
  hq_library_session: '/hq-library/session',
  topic_create_new_session: '/hq-library/topic/create-new-session',
  module_create_new_session: '/hq-library/module/create-new-session',
  session_create_new_session: '/hq-library/session/create-new-session',
  topic_create_new_content: '/hq-library/topic/create-new-content',
  module_create_new_content: '/hq-library/module/create-new-content',
  session_create_new_content: '/hq-library/session/create-new-content',
  community_library_topic: '/community-library/topic',
  community_library_module: '/community-library/module',
  community_module_session: '/community-library/module/session',
  community_library_session: '/community-library/session',
  community_topic_create_new_session: '/community-library/topic/create-new-session',
  community_module_create_new_session: '/community-library/module/create-new-session',
  community_session_create_new_session: '/community-library/session/create-new-session',
  community_topic_create_new_content: '/community-library/topic/create-new-content',
  community_module_create_new_content: '/community-library/module/create-new-content',
  community_session_create_new_content: '/community-library/session/create-new-content',
  content_management_create_new_session: '/content-management/new-session',
  content_management_update_session: '/content-management/update-session',
  content_management_add_content: '/content-management/add-content',
  notifications: '/notifications',
  class_management: '/class-management',
  class_forum: '/class-forum',
  class_library: '/class-library',
  my_group: '/my-group',
  todo_list: '/todo-list',
  messages: '/messages',
  student_list: '/student-list',
  attendance: '/attendance',
};

export const VIEW_ITEMS = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '30', value: '30' },
];

export const VIEW_ITEMS_HQ_LIBRARY = [
  { label: '9', value: '9' },
  { label: '12', value: '12' },
  { label: '21', value: '21' },
  { label: '30', value: '30' },
];

export enum TwoFAMethod {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  APP = 'APP',
  OFF = 'OFF',
}

export enum ORDER {
  ASC = 'ASC',
  DESC = 'DESC',
  ACTIVE = 'ACTIVE',
  DE_ACTIVE = 'DE_ACTIVE',
  QUANTITY_ASC = 'Q-ASC',
  QUANTITY_DESC = 'Q-DESC',
}

export enum KeyFormChangeData {
  ENTER = 'Enter',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'Complete',
  INCOMPLETE = 'Incomplete',
}

export enum FIELDS {
  HIDE = 'hide',
  ACTIVE = 'active',
  CHECKBOX_GROUP = 'checkbox-group',
  STRING = 'string',
  NUMBER = 'number',
  SELECT = 'select',
  SELECT_SEARCH = 'select-search',
  TEXT_AREA = 'textArea',
  DATE = 'date',
  EDITOR = 'editor',
  UPLOAD_FILE = 'uploadFile',
  PHONE_NUMBER = 'phoneNumber',
  GROUP_NAME = 'groupName',
}

export enum ROLE {
  ADMIN = 'Admin',
  TEACHER = 'TEACHER',
}

export enum TopicType {
  HQ_LIBRARY = 'HQ Library',
  COMMUNITY_LIBRARY = 'Community Library',
  CONTENT_MANAGEMENT = 'Content Management',
}

export const TYPES_IMAGE_UPLOAD = ['image/jpeg', 'image/jpg', 'image/png'];

export const TYPES_DOCUMENT_UPLOAD = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/pdf'
];

export const CLASS_NAME_FIELD =
  'h-12 rounded-2xl py-3 px-4 border border-solid border-[#E9E6E5] text-[#32302D] focus:border-[#E9E6E5]';

export const REGEX_PASSWORD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/;

export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const REGEX_LOGIN_ID = /^[A-Za-z0-9_-]*$/;

export const REGEX_NUMBER = /^[0-9]*$/;

export const DATE_FORMAT = 'YYYY/MM/DD';

export const DATE_FORMAT_TWO = 'YYYY-MM-DD';

export const DATE_TIME_FORMAT = 'YYYY/MM/DD HH:mm';

export const INPUT_TYPE = ['Dropdown', 'Radio Button', 'Checkbox'];

export const SELECT_SEARCH_CONFIG = {
  limit: 300,
  text: 'Type to search for more',
};

export const TEXT_SELECT_SEARCH = {
  category: 'Type to search for more categories',
  course: 'Type to search for more courses',
  centre: 'Type to search for more centres',
  module: 'Type to search for more modules',
  role: 'Type to search for more roles',
  subjectTag: 'Type to search for more subject tag',
  class: 'Type to search for more classes',
  topic: 'Type to search for more topics',
  sessionTag: 'Type to search for more session tag',
};

const limit = 300;
const page = 1;
const order = 'ASC';
const search = '';

export const EDITOR_CONFIG = {
  toolbar: [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'link',
    'bulletedList',
    'numberedList',
    'alignment',
    'fontColor',
    'fontBackgroundColor',
    '|',
    'undo',
    'redo',
  ],
  language: 'en',
  fontFamily: {
    options: ['Montserrat', 'Arial', 'sans-serif'],
  },
};

export const PARAMS_SELECT_SEARCH = {
  category: {
    limit,
    page,
    search,
    sort: 'categoryName',
    order,
  },
  course: {
    limit,
    page,
    search,
    sort: 'courseName',
    order,
  },
  centre: {
    limit,
    page,
    search,
    sort: 'centreName',
    order,
  },
  module: {
    limit,
    page,
    search,
    sort: 'topic.topicName',
    filters: JSON.stringify([{ topicType: TopicType.HQ_LIBRARY }]),
    order,
  },
  topic: {
    limit,
    page,
    search,
    sort: 'topic.topicName',
    filters: JSON.stringify([{ topicType: TopicType.HQ_LIBRARY }]),
    order,
  },
  community_topic: {
    limit,
    page,
    search,
    sort: 'topic.topicName',
    filters: JSON.stringify([{ topicType: TopicType.COMMUNITY_LIBRARY }]),
    order,
  },
  community_module: {
    limit,
    page,
    search,
    sort: 'topic.topicName',
    filters: JSON.stringify([{ topicType: TopicType.COMMUNITY_LIBRARY }]),
    order,
  },
  role: {
    limit,
    page,
    search,
    order,
  },
  subjectTag: {
    limit,
    page,
    search,
    sort: 'tagName',
    order,
  },
  teacher: {
    limit,
    page,
    search,
    sort: 'updatedAt',
    order,
  },
  class: {
    limit,
    page,
    search,
    sort: 'className',
    order,
  },
  sessionTag: {
    limit,
    page,
    search,
    sort: 'tagName',
    order,
  },
  default: {
    limit,
    page,
    search,
    order,
  },
};

export const SCREEN = {
  newSession: 'newSession',
  newContent: 'newContent',
  newSessionSummary: 'newSessionSummary',
  topic_tab: 'topic',
  module_tap: 'module',
  session_tap: 'session',
};
