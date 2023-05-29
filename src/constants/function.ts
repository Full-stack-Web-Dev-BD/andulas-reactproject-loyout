import { History, Transition } from 'history';
import { RefObject, useCallback, useContext, useEffect } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

export const useOnClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: () => void,
  exceptionRef?: RefObject<HTMLElement>,
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      if (
        !ref.current ||
        ref?.current?.contains(event.target as Node) ||
        exceptionRef?.current?.contains(event.target as Node)
      ) {
        return;
      }

      handler();
    };

    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler, exceptionRef]);
};

type ExtendNavigator = Navigator & Pick<History, 'block'>;
export function useBlocker(blocker: (tx: Transition) => void, when = true) {
  const { navigator } = useContext(NavigationContext);

  useEffect(() => {
    if (!when) return;

    const unblock = (navigator as any as ExtendNavigator).block((tx) => {
      const autoUnblockingTx = {
        ...tx,
        retry() {
          unblock();
          tx.retry();
        },
      };

      blocker(autoUnblockingTx);
    });

    return unblock;
  }, [navigator, blocker, when]);
}

export default function usePrompt(message: string, when = true, handleSubmit?: () => void) {
  const blocker = useCallback(
    (tx: Transition) => {
      if (window.confirm(message)) {
        if (handleSubmit instanceof Function) {
          handleSubmit();
          setTimeout(() => {
            tx.retry();
          }, 800);

          return;
        }
        tx.retry();
      }
    },
    [message],
  );

  useBlocker(blocker, when);
}

export const getSearchParams = (params: object) => {
  const paramsOption = [];
  for (const [index, [key, value]] of Object.entries(Object.entries(params))) {
    if (Number(index) === 0) {
      paramsOption.push(`?${key}=${value}`);
    } else if (value === '[{}]') {
      paramsOption.filter((item) => item !== '[{}]');
    } else if (value) {
      paramsOption.push(`&${key}=${value}`);
    }
  }
  return paramsOption.join('');
};

export const filterParams = (params: any) => {
 return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) =>  [v as string]?.toString() !== '',
    )
  )
}

export const countDateTime = (date: string) => {
  return (new Date().getTime() - new Date(date as string).getTime()) / (1000 * 3600 * 24);
};

export const wrapObjectValue = (data: { [key: string]: any }) => {
  for (const [, [key, value]] of Object.entries(Object.entries(data))) {
    if (!value) {
      delete data[key];
    }
  }
  return data;
};

export const roundingNumber = (value: number) => {
  const COUNT_FORMATS = [
    {
      // 0 - 999
      letter: '',
      limit: 1e3,
    },
    {
      // 1,000 - 999,999
      letter: 'K',
      limit: 1e6,
    },
    {
      // 1,000,000 - 999,999,999
      letter: 'M',
      limit: 1e9,
    },
    {
      // 1,000,000,000 - 999,999,999,999
      letter: 'B',
      limit: 1e12,
    },
    {
      // 1,000,000,000,000 - 999,999,999,999,999
      letter: 'T',
      limit: 1e15,
    },
  ];
  if (!value) {
    return '$0';
  }
  // Format Method:
  const format = COUNT_FORMATS.find((item: { limit: number }) => value < item.limit);
  value = (1000 * value) / Number(format?.limit);
  value = Math.round(value * 10) / 10; // keep one decimal number, only if needed

  if (format?.letter) {
    return '$' + parseFloat(value.toString()).toFixed(2).toString() + format?.letter;
  }
  return `$` + parseFloat(value.toString()).toFixed(2).toString();
};
