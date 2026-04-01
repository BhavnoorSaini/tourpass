import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import type { StoredRoute } from '@/types/route';

interface RoutesContextValue {
  routes: StoredRoute[];
  addRoute: (route: StoredRoute) => void;
  getRouteById: (id: string) => StoredRoute | undefined;
}

const RoutesContext = createContext<RoutesContextValue | undefined>(undefined);

export function RoutesProvider({ children }: PropsWithChildren) {
  const [routes, setRoutes] = useState<StoredRoute[]>([]);

  const addRoute = useCallback((route: StoredRoute) => {
    setRoutes((prev) => [...prev, route]);
  }, []);

  const getRouteById = useCallback(
    (id: string) => routes.find((route) => route.id === id),
    [routes],
  );

  const value = useMemo(
    () => ({
      routes,
      addRoute,
      getRouteById,
    }),
    [addRoute, getRouteById, routes],
  );

  return <RoutesContext.Provider value={value}>{children}</RoutesContext.Provider>;
}

export function useRoutes() {
  const context = useContext(RoutesContext);

  if (!context) {
    throw new Error('useRoutes must be used within a RoutesProvider');
  }

  return context;
}
