import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './routes';

/**
 * App Component
 * SOLID: Single Responsibility - Sadece router provider'ı başlatmaktan sorumlu
 * IOC: Router'ı dışarıdan inject eder
 */
function App(): JSX.Element {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;