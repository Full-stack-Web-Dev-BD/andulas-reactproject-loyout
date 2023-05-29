export const ERROR_MESSAGE = {
  OTP: 'OTP is incorrect or has expired. Please click on resend code to receive your new OTP',
  PASSWORD:
    'Password should consist of at least 8 characters, uppercase letters, lowercase letters, numbers and special characters (eg. !@#$^)',
  EMAIL: 'Email is invalid!',
  LOGIN_ID: 'Login ID is invalid!',
  EMAIL_ALREADY_EXIST: 'The email already exists!',
  ROLE_NAME_ALREADY_EXIST:
    'There is already a role created with the same role name. Please use another name.',
  COURSE_DELETE:
    'You are not allowed to delete the selected course/s as one of the course that you have selected is an ongoing class.',
  COURSE_ALREADY_EXIST: 'Course already exists!',
  CLASS_ALREADY_EXIST: 'Class already exists!',
  CLASS_DELETE:
    'You are not allowed to delete the selected class as one of the class that you have selected is an ongoing course.',
  START_DATE: 'Start date must be less than End date',
  END_DATE: 'End date must be less than Start date',
  CONTACT_NUMBER: 'Contact Number must be numbers (eg: 0-9)',
  POSTAL_CODE: 'Postal code must be numbers (eg: 0-9)',
  UPLOAD_FILE: 'File invalid (eg: PNG, JPEG, JPG)',
  LIMIT_SIZE: 'The image upload limit size must be less than 1MB',
  UPLOAD_FILE_IMAGE_PDF_ONLY: 'File invalid (eg: PNG, JPEG, JPG, PDF)',
  UPLOAD_FILE_VIDEO_ONLY: 'File invalid (eg:  mp4, webm, ogg, ogv, avi, mpeg, mpg, mov, wmv, 3gp)',
  UPLOAD_FILE_AUDIO_ONLY: 'File invalid (eg: mp3, aac, ogg, oga, wav, mpeg, webm, wma, aif, aiff)',
  UPLOAD_FILE_DOCUMENT_ONLY: 'File invalid (eg: XLSX, DOC, DOCX, PDF, PPT, PPTX)',
};

export const WARNING_MESSAGE = {
  LEAVE_PAGE:
    'You have modified the theme change. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving.',
  LEAVE_MANAGE_COURSE:
    'You have modified the Course change. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving.',
  LEAVE_MANAGE_CLASS:
    'You have modified the Class change. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving.',
  LEAVE_CREATE_ADMIN:
    'You have modified the create Admin change. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving.',
    LEAVE_CREATE_TEACHER:
    'You have modified the create Teacher change. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving.',
  LEAVE_COURSE_INFORMATION:
    'You have modified the Course Information. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving.',
  LEAVE_CATEGORY:
    'You have modified the category name. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving.',
  LEAVE_ANNOUNCEMENT:
    'You have modified the announcement change. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving.',
  LEAVE_CLASS_DETAIL:
    'You have modified the Class Information. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving.',
  CANCEL_REGISTRATION_DETAIL:
    'You have modified the Course Registration Details. Are you sure you want to cancel without saving? All changes will not be saved once you cancel without saving.',
  REQUIRE_SELECT_REGISTRATION_DETAIL_1: `Please select the fields required for students’ registration details.`,
  REQUIRE_SELECT_REGISTRATION_DETAIL_2: `*(Not applicable for courses that are auto-enrolled course type)`,
  LEAVE_MANAGE_ADMIN_INFO:
    'You have modified the content. Are you sure you want to leave without saving?',
  LEAVE_PROFILE_CHANGE_PASSWORD:
    'You have modified the Profile Password change. Are you sure you want to leave without saving?',
};
