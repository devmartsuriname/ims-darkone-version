import PageTitle from '@/components/PageTitle';
import { SystemDocumentation } from '@/components/documentation/SystemDocumentation';

export default function TechnicalDocumentationPage() {
  return (
    <>
      <PageTitle title="Technical Documentation" subName="Architecture & Implementation Guide" />
      <SystemDocumentation />
    </>
  );
}