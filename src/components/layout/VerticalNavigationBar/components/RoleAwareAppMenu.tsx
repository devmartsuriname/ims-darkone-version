import { MenuItemType } from '@/types/menu'
import { useAuthContext } from '@/context/useAuthContext'
import AppMenu from './AppMenu'

type RoleAwareAppMenuProps = {
  menuItems: Array<MenuItemType>
}

const RoleAwareAppMenu = ({ menuItems }: RoleAwareAppMenuProps) => {
  const { roles } = useAuthContext()

  // Function to check if user has required roles for menu item
  const hasMenuAccess = (item: MenuItemType): boolean => {
    // If no roles specified, item is accessible to all
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true
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

  return <AppMenu menuItems={filteredMenuItems} />
}

export default RoleAwareAppMenu