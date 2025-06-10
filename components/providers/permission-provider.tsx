'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

// Define the context type
type PermissionContextType = {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  loading: boolean;
  userRole: string | null;
};

// Create the context with default values
const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  hasPermission: () => false,
  loading: true,
  userRole: null,
});

// Provider component
export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Get the user's profile to determine their role
        const { data: userProfile } = await supabase
          .from('users')
          .select('role, staff_role_id')
          .eq('id', user.id)
          .single();

        if (!userProfile) {
          setLoading(false);
          return;
        }

        setUserRole(userProfile.role);

        // If the user has a staff role, fetch their specific permissions
        if (userProfile.staff_role_id) {
          const { data: rolePermissions } = await supabase
            .from('staff_role_permissions')
            .select(`
              permissions (
                name
              )
            `)
            .eq('role_id', userProfile.staff_role_id);

          if (rolePermissions) {
            const permissionNames = rolePermissions
              .map(rp => rp.permissions?.name)
              .filter(Boolean) as string[];
            
            setPermissions(permissionNames);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  // Function to check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    // Admin role has all permissions
    // if (userRole === 'admin') return true;
    
    return permissions.includes(permission);
  };

  return (
    <PermissionContext.Provider value={{ permissions, hasPermission, loading, userRole }}>
      {children}
    </PermissionContext.Provider>
  );
}

// Custom hook to use the permission context
export const usePermissions = () => useContext(PermissionContext);