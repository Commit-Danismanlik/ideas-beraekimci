import { lazy } from 'react';

const Login = lazy(() => import('../pages/Login').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('../pages/Register').then((module) => ({ default: module.Register })));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword').then((module) => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('../pages/ResetPassword').then((module) => ({ default: module.ResetPassword })));
const DashboardLayout = lazy(() =>
  import('../components/layouts/DashboardLayout').then((module) => ({
    default: module.DashboardLayout,
  }))
);
const DashboardViewOutlet = lazy(() =>
  import('../components/views/DashboardViewOutlet').then((module) => ({
    default: module.DashboardViewOutlet,
  }))
);
const NotFound = lazy(() => import('../pages/NotFound').then((module) => ({ default: module.NotFound })));

export interface IRouteConfig {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType> | React.ComponentType;
  name: string;
  breadcrumbLabel?: string;
  isProtected?: boolean;
  redirectTo?: string;
  children?: Array<{
    path?: string;
    element?: React.LazyExoticComponent<React.ComponentType> | React.ComponentType | null;
    name: string;
    index?: boolean;
    redirectTo?: string;
  }>;
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
    element: DashboardLayout,
    name: 'Dashboard',
    breadcrumbLabel: '📊 Dashboard',
    isProtected: true,
    children: [
      { name: 'DashboardIndex', index: true, redirectTo: 'personal' },
      { path: ':view', element: DashboardViewOutlet, name: 'DashboardView' },
    ],
  },
  {
    path: '/',
    element: DashboardLayout,
    name: 'Home',
    breadcrumbLabel: '🏠 Ana Sayfa',
    isProtected: true,
    redirectTo: '/dashboard/personal',
  },
  {
    path: '*',
    element: NotFound,
    name: 'NotFound',
    breadcrumbLabel: '❌ Sayfa Bulunamadı',
  },
];

export const getRoutes = (): IRouteConfig[] => {
  return routes;
};

export const getRouteByPath = (path: string): IRouteConfig | undefined => {
  return routes.find((route) => route.path === path);
};

export const getRouteByName = (name: string): IRouteConfig | undefined => {
  return routes.find((route) => route.name === name);
};

export const getProtectedRoutes = (): IRouteConfig[] => {
  return routes.filter((route) => route.isProtected === true);
};

export const getPublicRoutes = (): IRouteConfig[] => {
  return routes.filter((route) => !route.isProtected);
};

const routeConfig = {
  getRoutes,
  getRouteByPath,
  getRouteByName,
  getProtectedRoutes,
  getPublicRoutes,
};

export default routeConfig;

