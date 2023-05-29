import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createBrowserHistory } from 'history';

import RootComponent from './wrappers/Root';
import CustomRouter from './wrappers/CustomRouter';
import { AppProvider } from 'context';

export const history = createBrowserHistory();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, cacheTime: 12 * 60 * 1000, retry: false },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <CustomRouter history={history}>
          <Suspense fallback={null}>
            <RootComponent />
          </Suspense>
        </CustomRouter>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
