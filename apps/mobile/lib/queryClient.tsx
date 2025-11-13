import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider, dehydrate, focusManager, hydrate, type Query } from '@tanstack/react-query';

const QUERY_CACHE_STORAGE_KEY = '@mk/query-cache:v1';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const PERSISTED_ROOT_KEYS = new Set<string>([
  'mission-status',
  'discover-feed',
  'profile-summary',
  'practice-prompts',
]);

type QueryHydrationContextValue = {
  isHydrated: boolean;
};

const QueryHydrationContext = createContext<QueryHydrationContextValue>({ isHydrated: false });

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 24 * 60 * 60 * 1000,
        staleTime: 30 * 1000,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
        retry: 1,
        networkMode: 'offlineFirst',
      },
      mutations: {
        networkMode: 'offlineFirst',
      },
    },
  });
}

function shouldPersistQuery(query: Query) {
  const rootKey = query.queryKey?.at(0);
  return typeof rootKey === 'string' && PERSISTED_ROOT_KEYS.has(rootKey) && query.state.status === 'success';
}

function useFocusBinding() {
  useEffect(() => {
    const listener = (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    };
    const subscription = AppState.addEventListener('change', listener);
    return () => subscription.remove();
  }, []);
}

type MobileQueryClientProviderProps = {
  children: ReactNode;
};

export function MobileQueryClientProvider({ children }: MobileQueryClientProviderProps) {
  const queryClient = useMemo(() => createQueryClient(), []);
  const [isHydrated, setIsHydrated] = useState(false);
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSerializedRef = useRef<string | null>(null);

  useFocusBinding();

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: null | (() => void) = null;

    const persistCache = async () => {
      try {
        const serializedState = JSON.stringify({
          state: dehydrate(queryClient, {
            shouldDehydrateQuery: (query) => shouldPersistQuery(query),
          }),
          timestamp: Date.now(),
        });
        if (serializedState !== latestSerializedRef.current) {
          latestSerializedRef.current = serializedState;
          await AsyncStorage.setItem(QUERY_CACHE_STORAGE_KEY, serializedState);
        }
      } catch (error) {
        console.warn('[QueryPersistence] Failed to persist cache', error);
      }
    };

    const schedulePersist = () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
      persistTimeoutRef.current = setTimeout(() => {
        void persistCache();
      }, 500);
    };

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(QUERY_CACHE_STORAGE_KEY);
        if (raw) {
          const payload = JSON.parse(raw) as { state?: unknown; timestamp?: number };
          if (payload?.state && payload?.timestamp) {
            const isFresh = Date.now() - payload.timestamp < CACHE_TTL_MS;
            if (isFresh) {
              hydrate(queryClient, payload.state);
            } else {
              await AsyncStorage.removeItem(QUERY_CACHE_STORAGE_KEY);
            }
          }
        }
      } catch (error) {
        console.warn('[QueryPersistence] Failed to hydrate cache', error);
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }

      unsubscribe = queryClient.getQueryCache().subscribe(() => {
        schedulePersist();
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
      void persistCache();
    };
  }, [queryClient]);

  return (
    <QueryHydrationContext.Provider value={{ isHydrated }}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </QueryHydrationContext.Provider>
  );
}

export function useQueryHydration() {
  return useContext(QueryHydrationContext);
}
