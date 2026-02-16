import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { IRouteConfig } from './RouteConfig';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

const LoadingFallback = (): JSX.Element => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-indigo-300 font-semibold">Yükleniyor...</p>
    </div>
  </div>
);

type RouteChild = {
  path?: string;
  index?: boolean;
  element: JSX.Element;
};

const mapRouteToRouterConfig = (
  route: IRouteConfig
): { path: string; element: JSX.Element; children?: RouteChild[] } | null => {
  if (route.path === '*') {
    return null;
  }

  const path = route.path === '/' ? '' : route.path;

  if (route.redirectTo) {
    return {
      path,
      element: (
        <Navigate to={route.redirectTo || '/dashboard/personal'} replace />
      ),
    };
  }

  const Component = route.element;
  const wrapWithSuspense = (element: JSX.Element): JSX.Element => (
    <Suspense fallback={<LoadingFallback />}>{element}</Suspense>
  );

  if (route.children && route.children.length > 0 && Component) {
    const layoutElement = route.isProtected ? (
      <ProtectedRoute>
        <Component />
      </ProtectedRoute>
    ) : (
      <Component />
    );

    const children: RouteChild[] = route.children
      .filter((child) => child.element || child.redirectTo)
      .map((child) => {
        if (child.index && child.redirectTo) {
          return {
            index: true,
            element: <Navigate to={child.redirectTo} replace />,
          };
        }
        const ChildComponent = child.element;
        if (!ChildComponent) {
          return { path: child.path!, element: <Navigate to="." replace /> };
        }
        return {
          path: child.path ?? '',
          element: wrapWithSuspense(<ChildComponent />),
        };
      });

    return {
      path,
      element: wrapWithSuspense(layoutElement),
      children,
    };
  }

  if (route.isProtected && Component) {
    return {
      path,
      element: wrapWithSuspense(
        <ProtectedRoute>
          <Component />
        </ProtectedRoute>
      ),
    };
  }

  if (Component) {
    return {
      path,
      element: wrapWithSuspense(<Component />),
    };
  }

  return null;
};

const mapRoutesToChildren = (
  routes: IRouteConfig[]
): Array<{ path: string; element: JSX.Element; children?: RouteChild[] }> => {
  return routes
    .map(mapRouteToRouterConfig)
    .filter((r): r is NonNullable<typeof r> => r !== null);
};

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
            <Suspense fallback={<LoadingFallback />}>
              <NotFoundComponent />
            </Suspense>
          ) : (
            <Navigate to="/dashboard" replace />
          ),
        },
      ],
    },
  ]);
};

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

export const createRouterBuilder = (routeConfig: {
  getRoutes: () => IRouteConfig[];
}) => ({
  build: () => buildRouter(routeConfig),
  buildWithLazyLoading: () => buildRouterWithLazyLoading(routeConfig),
});

export default buildRouter;

