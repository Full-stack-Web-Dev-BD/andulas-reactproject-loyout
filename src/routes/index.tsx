// Pages
import { ROUTES } from 'constants/constants';
import DefaultLayoutLoginPage from 'layouts/login';
import AccessControl from 'pages/admin/access-control';
import AccessControlUpdate from 'pages/admin/access-control/access-control-update';
import CalendarTab from 'pages/admin/calendar';
import ContentManagement from 'pages/admin/content-management';
import CreateNewContentManagementSession from 'pages/admin/content-management/session/create-new-session';
import Courses from 'pages/admin/courses';
import MyCourse from 'pages/admin/courses/my-course';
import MyCourseDetail from 'pages/admin/courses/my-course/my-course-detail';
import MyCourseModule from 'pages/admin/courses/my-course/my-course-detail/my-course-module';
import MyCourseSession from 'pages/admin/courses/my-course/my-course-detail/my-course-session';
import Category from 'pages/admin/courses/category';
import CategoryUpdate from 'pages/admin/courses/category/category-update';
import CourseDetail from 'pages/admin/courses/course-detail';
import ManageClass from 'pages/admin/courses/manage-class';
import ManageClassDetail from 'pages/admin/courses/manage-class/manage-class-update';
import ManageAcceptance from 'pages/admin/courses/mange-acceptance';
import AutoEnrolled from 'pages/admin/courses/mange-acceptance/auto-enrolled';
import ByAdmission from 'pages/admin/courses/mange-acceptance/by-admission';
import ManageAcceptanceUpdate from 'pages/admin/courses/mange-acceptance/mange-acceptance-update';
import Dashboard from 'pages/admin/dashboard';
import CreateNewSession from 'pages/admin/hq-library/component/create-new-session';
import HQLibraryModule from 'pages/admin/hq-library/module';
import ModuleSession from 'pages/admin/hq-library/module/session';
import HQLibrarySession from 'pages/admin/hq-library/session';
import OverviewSession from 'pages/admin/hq-library/session/overview';
import HQLibraryTopic from 'pages/admin/hq-library/topic';
import ManageAdmin from 'pages/admin/manage-admin';
import AdminDetail from 'pages/admin/manage-admin/admin-detail';
import ManageStudent from 'pages/admin/manage-student';
import StudentDetail from 'pages/admin/manage-student/student-detail';
import ManageTeacher from 'pages/admin/manage-teacher';
import TeacherDetail from 'pages/admin/manage-teacher/teacher-detail';
import Profile from 'pages/admin/profile';
import AdminProfile from 'pages/admin/profile/admin-profile';
import ProfileChangePassword from 'pages/admin/profile/change-password';
import Guide from 'pages/admin/user-guide';
import Search from 'pages/admin/search';
import Setting from 'pages/admin/setting';
import Configure from 'pages/admin/setting/configrure';
import NewTheme from 'pages/admin/setting/new-theme';
import ThemeList from 'pages/admin/setting/theme-list';
import ForgotPassword from 'pages/auth/forgot-password';
import EmailSent from 'pages/auth/forgot-password/email-sent';
import ForgotPasswordFail from 'pages/auth/forgot-password/forgot-fail';
import TwoFactorForgotPassword from 'pages/auth/forgot-password/two-factor-forgot-password';
import Login from 'pages/auth/login';
import TwoFactor from 'pages/auth/login/two-factor';
import CreateNewPassword from 'pages/auth/new-password';
import Register from 'pages/auth/register';
import RegisterFail from 'pages/auth/register/register-fail';
import VerifyRegister from 'pages/auth/register/verify-register';
import PasswordUpdate from 'pages/auth/update-password';
import VerifiedEmail from 'pages/auth/verified-email';
import TrashDrive from 'pages/admin/my-drive/trash-drive';
import Notifications from 'pages/admin/notifications';
import Announcement from 'pages/admin/announcement';
import NewAnnouncement from 'pages/admin/announcement/new-announcement';
import ReportAdmin from 'pages/admin/report-admin';
import { FC, ReactElement, ReactNode } from 'react';
import ClassManagement from 'pages/admin/class-management';
import CommunityLibraryTopicTeacher from 'pages/admin/community-library/teacher/topic';
import CommunityLibraryModuleTeacher from 'pages/admin/community-library/teacher/module';
import CommunityLibrarySessionTeacher from 'pages/admin/community-library/teacher/session';
import CommunityModuleSessionTeacher from 'pages/admin/community-library/teacher/module/session';
import CommunityOverviewSessionTeacher from 'pages/admin/community-library/teacher/session/overview';
import CommunityCreateNewSessionTeacher from 'pages/admin/community-library/teacher/component/create-new-session';
import CommunityLibraryOverview from 'pages/admin/community-library/session/overview';
import CommunityLibraryContentCreation from 'pages/admin/community-library/session/overview/create-new-content';
import CommunityLibraryTopic from 'pages/admin/community-library/topic';
import CommunityLibraryModule from 'pages/admin/community-library/module';
import CommunityLibrarySession from 'pages/admin/community-library/session';
import HQLibraryTopicTeacher from 'pages/admin/hq-library/teacher/topic';
import HQLibraryModuleTeacher from 'pages/admin/hq-library/teacher/module';
import HQLibrarySessionTeacher from 'pages/admin/hq-library/teacher/session';
import HQLibraryOverviewTeacher from 'pages/admin/hq-library/teacher/session/overview';
import HQLibraryContentCreationTeacher from 'pages/admin/hq-library/teacher/session/overview/create-new-content';
import OverviewSessionContentManagement from 'pages/admin/content-management/session/overview';
import ClassAttendance from 'pages/admin/class-management/component/ClassAttendance';
import ClassAttendanceSession from 'pages/admin/class-management/component/ClassAttendance/component/ListSession';
import ClassAttendanceDate from 'pages/admin/class-management/component/ClassAttendance/component/ListDate';
import ClassAttendanceStudent from 'pages/admin/class-management/component/ClassAttendance/component/ListStudent';
import ClassManagementStudentList from 'pages/admin/class-management/component/StudentList';
interface IRoute {
  path: string;
  component: () => ReactElement;
  layout: ReactNode | FC;
}
const publicRoutes: Array<IRoute> = [
  { path: '/login', component: Login, layout: DefaultLayoutLoginPage },
  { path: '/two-factor', component: TwoFactor, layout: DefaultLayoutLoginPage },
  { path: '/forgot-password', component: ForgotPassword, layout: DefaultLayoutLoginPage },
  { path: '/forgot-failed', component: ForgotPasswordFail, layout: DefaultLayoutLoginPage },
  {
    path: '/two-factor-forgot-password',
    component: TwoFactorForgotPassword,
    layout: DefaultLayoutLoginPage,
  },
  { path: '/email-sent', component: EmailSent, layout: DefaultLayoutLoginPage },
  { path: '/create-new-password', component: CreateNewPassword, layout: DefaultLayoutLoginPage },
  { path: '/password-update', component: PasswordUpdate, layout: DefaultLayoutLoginPage },
  { path: '/register', component: Register, layout: DefaultLayoutLoginPage },
  { path: '/verify-register', component: VerifyRegister, layout: DefaultLayoutLoginPage },
  { path: '/register-failed', component: RegisterFail, layout: DefaultLayoutLoginPage },
  { path: '/verified-email', component: VerifiedEmail, layout: DefaultLayoutLoginPage },
];

const privateRoutes: Array<IRoute> = [
  { path: '/', component: Dashboard, layout: null },
  { path: ROUTES.dashboard, component: Dashboard, layout: null },
  { path: ROUTES.manage_course, component: Courses, layout: null },
  { path: ROUTES.manage_class, component: ManageClass, layout: null },
  { path: ROUTES.course_detail, component: CourseDetail, layout: null },
  { path: ROUTES.course_detail + '/:id', component: CourseDetail, layout: null },
  { path: ROUTES.course_detail + '/:id/:create', component: CourseDetail, layout: null },
  { path: ROUTES.manage_student, component: ManageStudent, layout: null },
  { path: ROUTES.my_course, component: MyCourse, layout: null },
  { path: ROUTES.my_course + '/:id', component: MyCourseDetail, layout: null },
  { path: ROUTES.my_course + '/:id/module/:moduleId', component: MyCourseModule, layout: null },
  { path: ROUTES.my_course + '/:id/module/:moduleId/session', component: MyCourseSession, layout: null },
  {
    path: `${ROUTES.student_detail}`,
    component: StudentDetail,
    layout: null,
  },
  {
    path: `${ROUTES.student_detail}/:id`,
    component: StudentDetail,
    layout: null,
  },
  { path: ROUTES.search, component: Search, layout: null },
  { path: ROUTES.access_control, component: AccessControl, layout: null },
  { path: ROUTES.new_manage_class, component: ManageClassDetail, layout: null },
  { path: ROUTES.new_manage_class + '/:id', component: ManageClassDetail, layout: null },
  { path: ROUTES.category, component: Category, layout: null },
  { path: `${ROUTES.update_category}/:id`, component: CategoryUpdate, layout: null },
  { path: ROUTES.update_category, component: CategoryUpdate, layout: null },
  { path: ROUTES.manage_acceptance, component: ManageAcceptance, layout: null },
  { path: ROUTES.by_admission, component: ByAdmission, layout: null },

  {
    path: `${ROUTES.manage_acceptance_update}/:id`,
    component: ManageAcceptanceUpdate,
    layout: null,
  },
  {
    path: `${ROUTES.auto_enrolled}`,
    component: AutoEnrolled,
    layout: null,
  },
  { path: ROUTES.teacher, component: ManageTeacher, layout: null },
  {
    path: `${ROUTES.teacher_detail}`,
    component: TeacherDetail,
    layout: null,
  },
  {
    path: `${ROUTES.teacher_detail}/:id`,
    component: TeacherDetail,
    layout: null,
  },

  //admin page
  { path: ROUTES.manage_admin, component: ManageAdmin, layout: null },
  {
    path: `${ROUTES.admin_detail}`,
    component: AdminDetail,
    layout: null,
  },
  {
    path: `${ROUTES.admin_detail}/:id`,
    component: AdminDetail,
    layout: null,
  },
  { path: ROUTES.report_admin, component: ReportAdmin, layout: null },

  { path: '/access-control/:id', component: AccessControlUpdate, layout: null },

  { path: ROUTES.setting_themes, component: Setting, layout: null },
  { path: '/settings/templates/:templateID/themes', component: ThemeList, layout: null },
  { path: '/settings/templates/theme', component: NewTheme, layout: null },
  { path: '/settings/templates/theme/:id', component: NewTheme, layout: null },
  { path: '/settings', component: Configure, layout: null },

  { path: ROUTES.profile_teacher_login_first_time, component: AdminProfile, layout: null },
  { path: ROUTES.profile_admin_login_first_time, component: AdminProfile, layout: null },
  { path: ROUTES.profile_me, component: Profile, layout: null },
  { path: ROUTES.profile_change_password, component: ProfileChangePassword, layout: null },
  { path: ROUTES.profile + '/:id', component: Profile, layout: null },
  { path: ROUTES.guide, component: Guide, layout: null },
  { path: `${ROUTES.teacher_detail}/:id`, component: TeacherDetail, layout: null },
  { path: `${ROUTES.teacher_detail}/:id/view-as`, component: Profile, layout: null },
  { path: `${ROUTES.student_detail}/:id/view-as`, component: Profile, layout: null },

  //My-drive
  { path: ROUTES.trash_drive, component: TrashDrive, layout: null },

  /*HQ-Library For Admin*/
  { path: `${ROUTES.hq_library_module}`, component: HQLibraryModule, layout: null },
  { path: `${ROUTES.hq_library_topic}/:topicId/module`, component: HQLibraryModule, layout: null },
  { path: `${ROUTES.module_session}`, component: ModuleSession, layout: null },
  {
    path: `${ROUTES.hq_library_topic}/:topicId/module/:moduleId/session`,
    component: ModuleSession,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library_topic}/:topicId/module/:moduleId/session/new-session`,
    component: CreateNewSession,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library_topic}/:topicId/module/:moduleId/session/:sessionId`,
    component: CreateNewSession,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library_module}/:moduleId/session/new-session`,
    component: CreateNewSession,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library_module}/:moduleId/session/:sessionId`,
    component: CreateNewSession,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library_session}/new-session`,
    component: CreateNewSession,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library_session}/:sessionId`,
    component: CreateNewSession,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library_session}/:sessionId/content-creation`,
    component: HQLibraryContentCreationTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library_session}/:sessionId/content-creation/teacher`,
    component: HQLibraryContentCreationTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library_topic}/:topicId/module/:moduleId/session/:sessionId/overview`,
    component: OverviewSession,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library_module}/:moduleId/session/:sessionId/overview`,
    component: OverviewSession,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library_module}/:moduleId/session/:sessionId/content-creation`,
    component: HQLibraryContentCreationTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library_module}/:moduleId/session/:sessionId/content-creation/teacher`,
    component: HQLibraryContentCreationTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library_session}/:sessionId/overview`,
    component: OverviewSession,
    layout: null,
  },
  { path: `${ROUTES.hq_library_module}/:moduleId/session`, component: ModuleSession, layout: null },
  { path: `${ROUTES.hq_library_topic}`, component: HQLibraryTopic, layout: null },
  { path: `${ROUTES.hq_library_session}`, component: HQLibrarySession, layout: null },
  { path: `${ROUTES.topic_create_new_session}`, component: CreateNewSession, layout: null },
  { path: `${ROUTES.module_create_new_session}`, component: CreateNewSession, layout: null },
  { path: `${ROUTES.session_create_new_session}`, component: CreateNewSession, layout: null },
  { path: `${ROUTES.hq_library_session}/:id`, component: CreateNewSession, layout: null },

  /*HQ-Library For Teacher*/
  {
    path: `${ROUTES.hq_library}/teacher`,
    component: HQLibraryTopicTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library}/topic/:topicId/module/teacher`,
    component: HQLibraryModuleTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library}/topic/:topicId/module/:moduleId/session/teacher`,
    component: HQLibrarySessionTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library}/topic/:topicId/module/:moduleId/session/:sessionId/overview/teacher`,
    component: HQLibraryOverviewTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.hq_library}/topic/:topicId/module/:moduleId/session/:sessionId/content-creation/teacher`,
    component: HQLibraryContentCreationTeacher,
    layout: null,
  },

  /*Community Library For Teacher*/
  { path: `${ROUTES.community_library_module}/teacher`, component: CommunityLibraryModuleTeacher, layout: null },
  {
    path: `${ROUTES.community_library_topic}/:topicId/module/teacher`,
    component: CommunityLibraryModuleTeacher,
    layout: null,
  },
  { path: `${ROUTES.community_module_session}/teacher`, component: CommunityModuleSessionTeacher, layout: null },
  {
    path: `${ROUTES.community_library_topic}/:topicId/module/:moduleId/session/teacher`,
    component: CommunityModuleSessionTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.community_library_topic}/:topicId/module/:moduleId/session/new-session/teacher`,
    component: CommunityCreateNewSessionTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.community_library_topic}/:topicId/module/:moduleId/session/:sessionId/teacher`,
    component: CommunityCreateNewSessionTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.community_library_module}/:moduleId/session/new-session/teacher`,
    component: CommunityCreateNewSessionTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.community_library_module}/:moduleId/session/:sessionId/teacher`,
    component: CommunityCreateNewSessionTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.community_library_session}/new-session/teacher`,
    component: CommunityCreateNewSessionTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.community_library_session}/:sessionId/teacher`,
    component: CommunityCreateNewSessionTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.community_library_session}/:sessionId/content-creation/teacher`,
    component: CommunityLibraryContentCreation,
    layout: null,
  },
  {
    path: `${ROUTES.community_library_topic}/:topicId/module/:moduleId/session/:sessionId/overview/teacher`,
    component: CommunityOverviewSessionTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.community_library_module}/:moduleId/session/:sessionId/overview/teacher`,
    component: CommunityOverviewSessionTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.community_library_module}/:moduleId/session/:sessionId/content-creation/teacher`,
    component: CommunityLibraryContentCreation,
    layout: null,
  },
  {
    path: `${ROUTES.community_library_session}/:sessionId/overview/teacher`,
    component: CommunityOverviewSessionTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.community_library_module}/:moduleId/session/teacher`,
    component: CommunityModuleSessionTeacher,
    layout: null,
  },
  { path: `${ROUTES.community_library_topic}/teacher`, component: CommunityLibraryTopicTeacher, layout: null },
  { path: `${ROUTES.community_library_session}/teacher`, component: CommunityLibrarySessionTeacher, layout: null },
  {
    path: `${ROUTES.community_topic_create_new_session}/teacher`,
    component: CommunityCreateNewSessionTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.community_module_create_new_session}/teacher`,
    component: CommunityCreateNewSessionTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.community_session_create_new_session}/teacher`,
    component: CommunityCreateNewSessionTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.community_library_session}/:id/teacher`,
    component: CommunityCreateNewSessionTeacher,
    layout: null,
  },

  /*Community Library For Admin*/
  {
    path: `${ROUTES.community_library}`,
    component: CommunityLibraryTopic,
    layout: null,
  },
  {
    path: `${ROUTES.community_library}/topic/:topicId/module`,
    component: CommunityLibraryModule,
    layout: null,
  },
  {
    path: `${ROUTES.community_library}/topic/:topicId/module/:moduleId/session`,
    component: CommunityLibrarySession,
    layout: null,
  },
  {
    path: `${ROUTES.community_library}/topic/:topicId/module/:moduleId/session/:sessionId/overview`,
    component: CommunityLibraryOverview,
    layout: null,
  },
  {
    path: `${ROUTES.community_library}/topic/:topicId/module/:moduleId/session/:sessionId/content-creation`,
    component: CommunityLibraryContentCreation,
    layout: null,
  },
  {
    path: `${ROUTES.community_library}/topic/:topicId/module/:moduleId/session/:sessionId/content-creation/teacher`,
    component: CommunityLibraryContentCreation,
    layout: null,
  },

  /*Content Management*/
  {
    path: `${ROUTES.content_management}`,
    component: ContentManagement,
    layout: null,
  },
  {
    path: `${ROUTES.content_management}/new-session`,
    component: CreateNewContentManagementSession,
    layout: null,
  },
  {
    path: `${ROUTES.content_management}/session/:sessionId/overview`,
    component: OverviewSessionContentManagement,
    layout: null,
  },
  {
    path: `${ROUTES.content_management}/session/:sessionId/content-creation`,
    component: HQLibraryContentCreationTeacher,
    layout: null,
  },
  {
    path: `${ROUTES.content_management}/update-session/:sessionId`,
    component: CreateNewContentManagementSession,
    layout: null,
  },
  {
    path: `${ROUTES.notifications}`,
    component: Notifications,
    layout: null,
  },

  {
    path: `${ROUTES.announcement}`,
    component: Announcement,
    layout: null,
  },

  {
    path: `${ROUTES.new_announcement}`,
    component: NewAnnouncement,
    layout: null,
  },

  {
    path: ROUTES.calendar,
    component: CalendarTab,
    layout: null,
  },

  /*Class Management*/
  {
    path: ROUTES.class_management,
    component: ClassManagement,
    layout: null,
  },
  {
    path: `${ROUTES.class_management}/:classId${ROUTES.attendance}`,
    component: ClassAttendance,
    layout: null,
  },
  {
    path: `${ROUTES.class_management}/:classId${ROUTES.attendance}/module/:moduleId`,
    component: ClassAttendanceSession,
    layout: null,
  },
  {
    path: `${ROUTES.class_management}/:classId${ROUTES.attendance}/module/:moduleId/session/:sessionId`,
    component: ClassAttendanceDate,
    layout: null,
  },
  {
    path: `${ROUTES.class_management}/:classId${ROUTES.attendance}/module/:moduleId/session/:sessionId/date/:classSessionId/:date`,
    component: ClassAttendanceStudent,
    layout: null,
  },

  /* student list */
  {
    path: `${ROUTES.class_management}/:classId${ROUTES.student_list}`,
    component: ClassManagementStudentList,
    layout: null,
  },

  { path: '*', component: Dashboard, layout: null },
];

export { publicRoutes, privateRoutes };
