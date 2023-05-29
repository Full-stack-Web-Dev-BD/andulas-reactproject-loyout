import { useEffect, useState } from 'react';

const useDebounce = (value: string, delay: number) => {
  const [deBounceValue, setDeBounceValue] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDeBounceValue(value), delay);

    return () => clearTimeout(handle);
  }, [value]);

  return deBounceValue;
};

export default useDebounce;
