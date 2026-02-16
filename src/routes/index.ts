import routeConfig from './RouteConfig';
import buildRouter from './RouterBuilder';

let routerInstance: ReturnType<typeof buildRouter> | null = null;

export const getRouter = (): ReturnType<typeof buildRouter> => {
  if (!routerInstance) {
    routerInstance = buildRouter(routeConfig);
  }
  return routerInstance;
};

export const resetRouter = (): void => {
  routerInstance = null;
};

export { routeConfig };

export const router = getRouter();

const routerFactory = {
  createRouter: getRouter,
  getRouteConfig: () => routeConfig,
  resetRouter,
};

export default routerFactory;

