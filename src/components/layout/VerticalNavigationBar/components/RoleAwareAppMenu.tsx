import { useEffect } from 'react'
import { MenuItemType } from '@/types/menu'
import { useAuthContext } from '@/context/useAuthContext'
import AppMenu from './AppMenu'

type RoleAwareAppMenuProps = {
  menuItems: Array<MenuItemType>
}

const RoleAwareAppMenu = ({ menuItems }: RoleAwareAppMenuProps) => {
  const { roles } = useAuthContext()

  // ✅ DEBUG: Log current user roles for troubleshooting
  useEffect(() => {
    if (roles && roles.length > 0) {
      const activeRoles = roles.filter(r => r.is_active).map(r => r.role)
      console.log('🔐 RoleAwareAppMenu - Active user roles:', activeRoles)
      console.log('📋 RoleAwareAppMenu - Total menu items:', menuItems.length)
    }
  }, [roles, menuItems])

  // Function to check if user has required roles for menu item
  const hasMenuAccess = (item: MenuItemType): boolean => {
    // ✅ SECURITY FIX: If no roles specified, deny access by default
    // This prevents accidental exposure of menu items
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      // Only titles can have no roles (section headers)
      if (item.isTitle) {
        return true
      }
      
      // For all other items, require explicit role definition
      console.warn(`⚠️ Menu item "${item.label}" has no allowedRoles - denying access`)
      return false
    }

    // If user has no roles, deny access
    if (!roles || roles.length === 0) {
      return false
    }

    // Get user's active roles
    const userRoles = roles.filter(r => r.is_active).map(r => r.role)

    // Admin and IT roles always have access
    if (userRoles.includes('admin') || userRoles.includes('it')) {
      return true
    }

    // Check if user has any of the required roles
    return item.allowedRoles.some(role => userRoles.includes(role as any))
  }

  // Recursively filter menu items based on role access
  const filterMenuByRole = (items: MenuItemType[]): MenuItemType[] => {
    return items
      .map(item => ({
        ...item,
        children: item.children ? filterMenuByRole(item.children) : undefined
      }))
      .filter(item => {
        // For title items, show if any children are visible
        if (item.isTitle) {
          const nextItems = items.slice(items.indexOf(item) + 1)
          const nextTitleIndex = nextItems.findIndex(i => i.isTitle)
          const sectionItems = nextTitleIndex >= 0 
            ? nextItems.slice(0, nextTitleIndex)
            : nextItems
          
          return sectionItems.some(sectionItem => hasMenuAccess(sectionItem))
        }
        
        // For regular items, check access
        return hasMenuAccess(item)
      })
  }

  const filteredMenuItems = filterMenuByRole(menuItems)

  // ✅ DEBUG: Log filtered result
  useEffect(() => {
    if (roles && roles.length > 0) {
      console.log('📋 RoleAwareAppMenu - Filtered items:', filteredMenuItems.length)
    }
  }, [filteredMenuItems, roles])

  return <AppMenu menuItems={filteredMenuItems} />
}

export default RoleAwareAppMenu