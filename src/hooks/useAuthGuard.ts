import { useEffect } from 'react';
import { useUser } from './useUser';
import { useRouter } from 'next/navigation';

export function useAuthGuard() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  return { user, loading };
} 