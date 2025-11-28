import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ResetPassword } from '../pages/ResetPassword';
import { Dashboard } from '../pages/Dashboard';
import { NotFound } from '../pages/NotFound';

/**
 * Route tanımlamaları
 * SOLID: Single Responsibility - Sadece route tanımlamalarından sorumlu
 * Immutable data structure
 */
export interface IRouteConfig {
  path: string;
  element: React.ComponentType;
  name: string;
  breadcrumbLabel?: string;
  isProtected?: boolean;
  redirectTo?: string;
}

const routes: IRouteConfig[] = [
  {
    path: '/login',
    element: Login,
    name: 'Login',
    breadcrumbLabel: '🔐 Giriş Yap',
  },
  {
    path: '/register',
    element: Register,
    name: 'Register',
    breadcrumbLabel: '📝 Kayıt Ol',
  },
  {
    path: '/forgot-password',
    element: ForgotPassword,
    name: 'ForgotPassword',
    breadcrumbLabel: '🔑 Şifremi Unuttum',
  },
  {
    path: '/reset-password',
    element: ResetPassword,
    name: 'ResetPassword',
    breadcrumbLabel: '🔄 Şifre Sıfırla',
  },
  {
    path: '/dashboard',
    element: Dashboard,
    name: 'Dashboard',
    breadcrumbLabel: '📊 Dashboard',
    isProtected: true,
  },
  {
    path: '/',
    element: Dashboard,
    name: 'Home',
    breadcrumbLabel: '🏠 Ana Sayfa',
    isProtected: true,
    redirectTo: '/dashboard',
  },
  {
    path: '*',
    element: NotFound,
    name: 'NotFound',
    breadcrumbLabel: '❌ Sayfa Bulunamadı',
  },
];

/**
 * Tüm route tanımlamalarını döner
 * Pure Function - Yan etki yok, her zaman aynı sonucu döner
 * @returns {Array<IRouteConfig>} Route yapılandırma dizisi
 */
export const getRoutes = (): IRouteConfig[] => {
  return routes;
};

/**
 * Belirli bir path için route bulur
 * Pure Function - Sadece parametre ile çalışır
 * @param {string} path - Aranacak route path'i
 * @returns {IRouteConfig|undefined} Bulunan route veya undefined
 */
export const getRouteByPath = (path: string): IRouteConfig | undefined => {
  return routes.find((route) => route.path === path);
};

/**
 * Route isimlerine göre route bulur
 * Pure Function - Sadece parametre ile çalışır
 * @param {string} name - Aranacak route ismi
 * @returns {IRouteConfig|undefined} Bulunan route veya undefined
 */
export const getRouteByName = (name: string): IRouteConfig | undefined => {
  return routes.find((route) => route.name === name);
};

/**
 * Protected route'ları döner
 * Pure Function - Sadece parametre ile çalışır
 * @returns {Array<IRouteConfig>} Protected route listesi
 */
export const getProtectedRoutes = (): IRouteConfig[] => {
  return routes.filter((route) => route.isProtected === true);
};

/**
 * Public route'ları döner
 * Pure Function - Sadece parametre ile çalışır
 * @returns {Array<IRouteConfig>} Public route listesi
 */
export const getPublicRoutes = (): IRouteConfig[] => {
  return routes.filter((route) => !route.isProtected);
};

/**
 * Route config objesi - Factory pattern ile API sağlar
 */
const routeConfig = {
  getRoutes,
  getRouteByPath,
  getRouteByName,
  getProtectedRoutes,
  getPublicRoutes,
};

export default routeConfig;

