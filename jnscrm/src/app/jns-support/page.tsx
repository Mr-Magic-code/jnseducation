import Breadcrumb from '@/components/Breadcrumb';
import Support from '@/components/GeneralFormsComponents/Support';
import PageHeader from '@/components/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support | JnS Education',
  description: 'Get help from the JnS Education support team.',
};

export default function SupportPage() {
  return (
    <>
      <PageHeader title="Support" />
      <Breadcrumb />
      <Support />
    </>
  );
}
