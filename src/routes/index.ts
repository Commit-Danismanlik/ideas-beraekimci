import routeConfig from './RouteConfig';
import buildRouter from './RouterBuilder';

/**
 * Router Factory - Functional Approach
 * IOC Container pattern - Bağımlılıkları yönetir ve router instance'ı sağlar
 * Singleton Pattern - Closure kullanarak tek instance garanti eder
 */

/**
 * Router instance'ını oluşturur (Memoized)
 * Singleton pattern - İlk çağrıda oluşturulur, sonraki çağrılarda cache'den döner
 */
let routerInstance: ReturnType<typeof buildRouter> | null = null;

/**
 * Router instance'ını döner veya oluşturur
 * Lazy Initialization - İlk kullanımda oluşturulur
 * @returns {Router} Router instance
 */
export const getRouter = (): ReturnType<typeof buildRouter> => {
  if (!routerInstance) {
    // Dependency Injection - RouteConfig'i parametre olarak geçir
    routerInstance = buildRouter(routeConfig);
  }
  return routerInstance;
};

/**
 * Router instance'ını sıfırlar (Test için kullanışlı)
 * @returns {void}
 */
export const resetRouter = (): void => {
  routerInstance = null;
};

/**
 * Route config'i export et
 */
export { routeConfig };

/**
 * Router instance - Lazy initialization ile
 */
export const router = getRouter();

/**
 * Router factory objesi - Object composition pattern
 */
const routerFactory = {
  createRouter: getRouter,
  getRouteConfig: () => routeConfig,
  resetRouter,
};

export default routerFactory;

