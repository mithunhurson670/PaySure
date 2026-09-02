import React from 'react';
import { useApp } from '../../context/AppContext';
import { AuthLayout } from './AuthLayout';
import { LoginPage } from './LoginPage';
import { SignUpPage } from './SignUpPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';

export const AuthContainer: React.FC = () => {
  const { authView } = useApp();

  let title = 'Sign in to PaySure';
  let subtitle = 'Secure access to your MSME Capital Guard & Deal Safety Engine';

  if (authView === 'signup' || authView === 'business-registration') {
    title = 'Register Your Business';
    subtitle = 'Set up your enterprise profile and working capital baseline';
  } else if (authView === 'forgot-password') {
    title = 'Reset Your Password';
    subtitle = 'Enter your email to receive recovery instructions';
  }

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      {authView === 'login' && <LoginPage />}
      {(authView === 'signup' || authView === 'business-registration') && <SignUpPage />}
      {authView === 'forgot-password' && <ForgotPasswordPage />}
    </AuthLayout>
  );
};
