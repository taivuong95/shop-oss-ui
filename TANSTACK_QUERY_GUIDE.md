# TanStack Query Implementation Guide

This project now includes TanStack Query (React Query) for efficient data fetching, caching, and state management.

## 🚀 Features Added

### 1. **Authentication System**
- Login/logout functionality with TanStack Query
- Automatic token management
- User session persistence
- Protected routes with AuthGuard

### 2. **API Client**
- Centralized API client with authentication headers
- Error handling and response parsing
- TypeScript support with proper types

### 3. **Query Hooks**
- `useLogin()` - Handle user login
- `useLogout()` - Handle user logout
- `useCurrentUser()` - Get current user data
- `useIsAuthenticated()` - Check authentication status
- `useUsers()` - Fetch users list
- `useUser(id)` - Fetch single user
- `useCreateUser()` - Create new user
- `useUpdateUser()` - Update user
- `useDeleteUser()` - Delete user

## 📁 File Structure

```
src/
├── lib/
│   └── api.ts                 # API client and auth functions
├── hooks/
│   ├── useAuth.ts             # Authentication hooks
│   └── useUsers.ts            # Users data hooks
├── components/
│   ├── providers/
│   │   └── QueryProvider.tsx  # TanStack Query provider
│   ├── AuthGuard.tsx          # Route protection
│   ├── Navbar.tsx             # Updated with logout
│   └── UsersList.tsx          # Example component
└── app/
    ├── api/
    │   └── auth/
    │       └── login/
    │           └── route.ts    # Login API endpoint
    ├── login/
    │   └── page.tsx           # Updated login page
    └── layout.tsx             # Updated with QueryProvider
```

## 🔧 Setup

### 1. **Dependencies**
```bash
bun add @tanstack/react-query @tanstack/react-query-devtools
```

### 2. **Provider Setup**
The `QueryProvider` is already set up in `src/app/layout.tsx` and includes:
- Query client configuration
- React Query DevTools (disabled by default)
- Optimistic updates and error handling

### 3. **Environment Variables**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🎯 Usage Examples

### **Authentication**

```tsx
import { useLogin, useIsAuthenticated } from '@/hooks/useAuth';

function LoginComponent() {
  const loginMutation = useLogin();
  const { isAuthenticated } = useIsAuthenticated();

  const handleLogin = async (credentials) => {
    try {
      await loginMutation.mutateAsync(credentials);
      // Redirect or show success message
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit(handleLogin)}>
      {/* form fields */}
    </form>
  );
}
```

### **Data Fetching**

```tsx
import { useUsers, useDeleteUser } from '@/hooks/useUsers';

function UsersComponent() {
  const { data: users, isLoading, error } = useUsers();
  const deleteUserMutation = useDeleteUser();

  const handleDelete = async (userId) => {
    await deleteUserMutation.mutateAsync(userId);
    // Query cache is automatically updated
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### **Mutations with Optimistic Updates**

```tsx
import { useUpdateUser } from '@/hooks/useUsers';

function EditUserComponent({ userId }) {
  const updateUserMutation = useUpdateUser();

  const handleUpdate = async (userData) => {
    await updateUserMutation.mutateAsync({
      id: userId,
      data: userData
    });
    // Cache is automatically updated
  };
}
```

## 🔐 Authentication Flow

1. **Login**: User submits credentials → API call → Store token → Update cache
2. **Protected Routes**: Check authentication → Redirect if not authenticated
3. **Logout**: Clear token → Clear cache → Redirect to login

## 🎨 React Query DevTools

The DevTools are included but hidden by default. To enable them:
1. Open your app in development mode
2. Look for the floating React Query logo
3. Click to open the DevTools panel

## 📊 Query Keys Structure

```tsx
// Authentication
authKeys.user = ['auth', 'user']

// Users
userKeys.all = ['users']
userKeys.lists = ['users', 'list']
userKeys.details = ['users', 'detail']
userKeys.detail = (id) => ['users', 'detail', id]
```

## 🚀 Benefits

1. **Automatic Caching**: Data is cached and shared across components
2. **Background Updates**: Data stays fresh with automatic refetching
3. **Optimistic Updates**: UI updates immediately, then syncs with server
4. **Error Handling**: Built-in error states and retry logic
5. **Loading States**: Automatic loading indicators
6. **TypeScript Support**: Full type safety throughout

## 🔄 Cache Management

- **Stale Time**: 5 minutes for most queries
- **Retry**: 1 retry for failed requests
- **Background Refetch**: Automatic when window regains focus
- **Cache Invalidation**: Automatic when mutations succeed

## 🎯 Demo Credentials

- **Email**: test@example.com
- **Password**: password

## 🛠️ Customization

### **Adding New API Endpoints**

1. Add to `src/lib/api.ts`:
```tsx
export const newApi = {
  getData: () => apiClient.get('/api/new-endpoint'),
  createData: (data) => apiClient.post('/api/new-endpoint', data),
};
```

2. Create hooks in `src/hooks/useNewData.ts`:
```tsx
export const useNewData = () => {
  return useQuery({
    queryKey: ['newData'],
    queryFn: newApi.getData,
  });
};
```

### **Environment-Specific Configuration**

```tsx
// src/lib/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://api.production.com');
```

## 🐛 Troubleshooting

### **Common Issues**

1. **Hydration Errors**: Ensure QueryProvider wraps the entire app
2. **Cache Not Updating**: Check query keys and invalidation logic
3. **Authentication Issues**: Verify token storage and API endpoints

### **Debug Mode**

Enable React Query DevTools to debug:
- Query states
- Cache contents
- Network requests
- Performance metrics

## 📈 Performance Tips

1. **Use `staleTime`** to reduce unnecessary requests
2. **Implement `select`** for data transformation
3. **Use `enabled`** to conditionally run queries
4. **Leverage `keepPreviousData`** for smooth transitions
5. **Implement proper error boundaries**

## 🔗 Related Links

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) 