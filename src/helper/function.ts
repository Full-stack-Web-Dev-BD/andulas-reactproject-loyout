export const isEmptyObject = (obj: any) => {
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
  }
  return true;
};

export const truncateString = (str: string, stringLength: number) => {
  if (str.length > stringLength) {
    return str.slice(0, stringLength) + '...';
  } else {
    return str;
  }
};

export const getDaysArray = (start: Date, end: Date) => {
  const arr = [];
  for (let dt = new Date(start); dt <= new Date(end); dt.setDate(dt.getDate() + 1)) {
    const newDate = new Date(dt);
    arr.push(new Date(newDate.setHours(23, 59, 59, 0)));
  }
  return arr;
};