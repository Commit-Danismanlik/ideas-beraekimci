import { createBrowserRouter, Navigate } from 'react-router-dom';
import { IRouteConfig } from './RouteConfig';
import { ProtectedRoute } from '../components/ProtectedRoute';

/**
 * Router Builder - Functional Approach
 * SOLID: Single Responsibility - Sadece router oluşturmaktan sorumlu
 * IOC: Bağımlılıkları parametre olarak alır (Dependency Injection)
 */

/**
 * Route'ları map'ler ve child route formatına çevirir
 * Pure Function - Yan etki yok
 * @param {Array<IRouteConfig>} routes - Route listesi
 * @returns {Array} Çevrilmiş route listesi
 */
const mapRoutesToChildren = (routes: IRouteConfig[]): Array<{
  path: string;
  element: JSX.Element;
}> => {
  return routes
    .filter((route) => route.path !== '*') // Wildcard route'u ayrı handle et
    .map((route) => {
      const Component = route.element;

      // Protected route ise ProtectedRoute wrapper'ı ile sar
      if (route.isProtected) {
        return {
          path: route.path === '/' ? '' : route.path,
          element: (
            <ProtectedRoute>
              <Component />
            </ProtectedRoute>
          ),
        };
      }

      // Redirect varsa Navigate kullan
      if (route.redirectTo) {
        return {
          path: route.path === '/' ? '' : route.path,
          element: <Navigate to={route.redirectTo || '/dashboard'} replace />,
        };
      }

      // Normal route
      return {
        path: route.path === '/' ? '' : route.path,
        element: <Component />,
      };
    });
};

/**
 * React Router instance'ı oluşturur
 * Pure Function - Aynı input için her zaman aynı output
 * @param {Object} routeConfig - Route konfigürasyon objesi
 * @returns {Router} BrowserRouter instance
 */
export const buildRouter = (routeConfig: {
  getRoutes: () => IRouteConfig[];
}): ReturnType<typeof createBrowserRouter> => {
  const routes = routeConfig.getRoutes();
  const notFoundRoute = routes.find((route) => route.path === '*');
  const NotFoundComponent = notFoundRoute ? notFoundRoute.element : null;

  return createBrowserRouter([
    {
      path: '/',
      children: [
        ...mapRoutesToChildren(routes),
        {
          path: '*',
          element: NotFoundComponent ? (
            <NotFoundComponent />
          ) : (
            <Navigate to="/dashboard" replace />
          ),
        },
      ],
    },
  ]);
};

/**
 * Lazy loading desteği ile router oluşturur
 * Pure Function - Aynı input için her zaman aynı output
 * @param {Object} routeConfig - Route konfigürasyon objesi
 * @returns {Router} BrowserRouter instance with lazy loading
 */
export const buildRouterWithLazyLoading = (
  routeConfig: {
    getRoutes: () => IRouteConfig[];
  }
): ReturnType<typeof createBrowserRouter> => {
  const routes = routeConfig.getRoutes();

  return createBrowserRouter([
    {
      path: '/',
      children: [
        ...routes.map((route) => ({
          path: route.path === '/' ? '' : route.path,
          lazy: async () => {
            const Component = route.element;
            return {
              Component: route.isProtected
                ? () => (
                    <ProtectedRoute>
                      <Component />
                    </ProtectedRoute>
                  )
                : Component,
            };
          },
        })),
        {
          path: '*',
          element: <Navigate to="/dashboard" replace />,
        },
      ],
    },
  ]);
};

/**
 * Router builder factory
 * Higher Order Function - Fonksiyon döner
 * IOC: RouteConfig'i inject eder
 * @param {Object} routeConfig - Route konfigürasyon objesi
 * @returns {Object} Builder metodları içeren obje
 */
export const createRouterBuilder = (routeConfig: {
  getRoutes: () => IRouteConfig[];
}) => ({
  build: () => buildRouter(routeConfig),
  buildWithLazyLoading: () => buildRouterWithLazyLoading(routeConfig),
});

export default buildRouter;

