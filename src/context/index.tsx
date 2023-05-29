import React, { ReactElement, useState } from 'react';

const AppContext = React.createContext([{}, () => {}]);

const AppProvider = ({children}: {children: ReactElement}) => {
  const [state, setState] = useState({
    profile: null,
    user: null,
    countNotification: 0,
    countAnnouncement: 0
  });
  return (
    <AppContext.Provider value={[state, setState]}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };