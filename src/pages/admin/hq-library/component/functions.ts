export const getPathName = (pathName: string) => {
  if (pathName.includes('topic')) {
    return 'Topic';
  } else if (pathName.includes('module')) {
    return 'Module';
  } else {
    return 'Session';
  }
};
