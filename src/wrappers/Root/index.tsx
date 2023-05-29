import DefaultLayoutAdminPage from 'layouts/admin';
import DefaultLayoutLoginPage from 'layouts/login';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { privateRoutes, publicRoutes } from 'routes';

const RootComponent = () => {
  const accessToken = sessionStorage.getItem('token') || localStorage.getItem('token');

  return (
    <Routes>
      {publicRoutes?.length > 0 &&
        publicRoutes.map((route, index) => {
          const Page = route.component;
          const Layout = !route.layout ? DefaultLayoutAdminPage : DefaultLayoutLoginPage;
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <Layout>
                  <Page></Page>
                </Layout>
              }
            />
          );
        })}
      {privateRoutes?.length > 0 &&
        privateRoutes.map((route, index) => {
          const Page = route.component;
          const Layout = !route.layout ? DefaultLayoutAdminPage : DefaultLayoutLoginPage;
          return (
            <Route
              key={index}
              path={route.path}
              element={
                !accessToken ? (
                  <Navigate to="/login" />
                ) : (
                  <Layout>
                    <Page></Page>
                  </Layout>
                )
              }
            />
          );
        })}
    </Routes>
  );
};

export default RootComponent;
