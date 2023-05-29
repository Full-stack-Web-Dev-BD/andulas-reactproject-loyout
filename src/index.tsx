import React from 'react';
// import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';

import 'antd/dist/antd.less';
import './styles/index.css';
import '@fontsource/merriweather';
import '@fontsource/montserrat';

import i18n from 'helper/i18n';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ReactDOM from 'react-dom/client';
import './styles/responsive.css'

const container = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(container);

root.render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>,
  // document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
