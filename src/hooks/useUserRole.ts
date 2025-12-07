import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Obrador {
  id: string;
  name: string;
  code: string;
}

interface UserRoleInfo {
  isAdmin: boolean;
  isOperario: boolean;
  obrador: Obrador | null;
  loading: boolean;
}

export function useUserRole(): UserRoleInfo {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [obrador, setObrador] = useState<Obrador | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setObrador(null);
      setLoading(false);
      return;
    }

    const fetchRoleAndObrador = async () => {
      setLoading(true);
      try {
        // Fetch user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        setIsAdmin(roleData?.role === 'admin');

        // Fetch user profile with obrador
        const { data: profileData } = await supabase
          .from('profiles')
          .select('obrador_id')
          .eq('user_id', user.id)
          .single();

        if (profileData?.obrador_id) {
          const { data: obradorData } = await supabase
            .from('obradores')
            .select('id, name, code')
            .eq('id', profileData.obrador_id)
            .single();

          if (obradorData) {
            setObrador(obradorData);
          }
        }
      } catch (error) {
        console.error('Error fetching user role/obrador:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleAndObrador();
  }, [user]);

  return {
    isAdmin,
    isOperario: !isAdmin,
    obrador,
    loading,
  };
}
