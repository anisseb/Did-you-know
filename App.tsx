/* eslint-disable import/first */
import './i18n';

import React from 'react';
import { I18nextProvider } from 'react-i18next';
import AppNavigator from './app/_layout';
import { AuthProvider } from './app/context/AuthContext';
import i18n from './i18n';

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </I18nextProvider>
  );
}