/**
 * Tests for AuthWrapper component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthWrapper from '@/app/components/AuthWrapper';
import { useAuth } from '@/app/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';

// Mock the auth context hook
jest.mock('@/app/context/auth-context', () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock error logging
jest.mock('@/lib/errorHandling', () => ({
  logError: jest.fn(),
}));

describe('AuthWrapper', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    jest.clearAllMocks();
  });

  test('renders children when authentication is not required', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      userRole: null,
      isLoading: false,
    });

    render(
      <AuthWrapper requireAuth={false}>
        <div data-testid="child-component">Protected Content</div>
      </AuthWrapper>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  test('shows loading state when authentication is in progress', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      userRole: null,
      isLoading: true,
    });

    render(
      <AuthWrapper requireAuth={true}>
        <div data-testid="child-component">Protected Content</div>
      </AuthWrapper>
    );

    expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('redirects when authentication is required but user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      userRole: null,
      isLoading: false,
    });

    render(
      <AuthWrapper requireAuth={true} redirectPath="/login">
        <div data-testid="child-component">Protected Content</div>
      </AuthWrapper>
    );

    expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    expect(mockRouter.push).toHaveBeenCalledWith('/login?returnUrl=%2Fdashboard');
  });

  test('renders children when user is authenticated and no roles are required', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
      userRole: 'restaurant_owner',
      isLoading: false,
    });

    render(
      <AuthWrapper requireAuth={true}>
        <div data-testid="child-component">Protected Content</div>
      </AuthWrapper>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  test('renders children when user has required role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
      userRole: 'system_admin',
      isLoading: false,
    });

    render(
      <AuthWrapper requireAuth={true} allowedRoles={['system_admin', 'restaurant_owner']}>
        <div data-testid="child-component">Protected Content</div>
      </AuthWrapper>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  test('redirects when user does not have required role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
      userRole: 'restaurant_staff',
      isLoading: false,
    });

    render(
      <AuthWrapper requireAuth={true} allowedRoles={['system_admin', 'restaurant_owner']}>
        <div data-testid="child-component">Protected Content</div>
      </AuthWrapper>
    );

    expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });
}); 