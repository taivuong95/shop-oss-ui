import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginCredentials, UserInfo, LoginResponse } from '@/lib/api';

// Query keys
export const authKeys = {
  user: ['auth', 'user'] as const,
};

// Hook for login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data: LoginResponse) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('loggedIn', 'true');
      }
      queryClient.setQueryData(authKeys.user, data.user);
    },
    onError: (error: Error) => {
      console.error('Login failed:', error.message);
    },
  });
};

// Hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.user });
    },
    onError: (error: Error) => {
      console.error('Logout failed:', error.message);
    },
  });
};

// Hook for getting current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: authApi.getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

// Hook for checking if user is authenticated
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useCurrentUser();

  return {
    isAuthenticated: !!user,
    isLoading,
    user: user as UserInfo | null,
  };
}; 