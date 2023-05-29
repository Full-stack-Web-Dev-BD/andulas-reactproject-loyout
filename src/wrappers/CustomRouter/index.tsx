import { BrowserHistory } from 'history';
import React, { FC, useLayoutEffect, useState } from 'react';
import { Router } from 'react-router-dom';
interface CustomRouterProps {
  history: BrowserHistory;
  children: JSX.Element;
}

const CustomRouter: FC<CustomRouterProps> = ({ history, ...restProps }) => {
  const [state, setState] = useState({
    action: history.action,
    location: history.location,
  });

  useLayoutEffect(() => history.listen(setState), [history]);

  return (
    <Router
      {...restProps}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    />
  );
};

export default CustomRouter;
