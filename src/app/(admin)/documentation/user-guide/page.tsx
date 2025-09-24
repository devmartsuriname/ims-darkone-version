import PageTitle from '@/components/PageTitle';
import { SystemDocumentation } from '@/components/documentation/SystemDocumentation';

export default function UserGuidePage() {
  return (
    <>
      <PageTitle title="User Guide" subName="Complete System Documentation" />
      <SystemDocumentation />
    </>
  );
}