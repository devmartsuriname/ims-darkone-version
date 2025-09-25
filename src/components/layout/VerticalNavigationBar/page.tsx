import { getMenuItems } from '@/helpers/Manu'
import SimplebarReactClient from '@/components/wrapper/SimplebarReactClient'
import LogoBox from '@/components/wrapper/LogoBox'
import RoleAwareAppMenu from './components/RoleAwareAppMenu'

const page = () => {
  const menuItems = getMenuItems()
  return (
    <div className="app-sidebar">
      <LogoBox />
      <SimplebarReactClient className="scrollbar" data-simplebar>
        <RoleAwareAppMenu menuItems={menuItems} />
      </SimplebarReactClient>
    </div>
  )
}

export default page
