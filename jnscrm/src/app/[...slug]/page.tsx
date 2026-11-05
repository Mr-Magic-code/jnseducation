import { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';

const SECTIONS: Record<string, { title: string; description: string }> = {
  'study-levels': {
    title: 'Study Levels',
    description: 'Foundation, undergraduate, postgraduate and pre-master pathways for international students.',
  },
  'study-destinations': {
    title: 'Study Destinations',
    description: 'UK, USA, Canada, UAE, New Zealand and Malaysia study abroad options.',
  },
  'test-centers': {
    title: 'Test Centers',
    description: 'IELTS, PTE Academic and English preparation test centres.',
  },
  'how-to-apply': {
    title: 'How to Apply',
    description: 'Application steps, eligibility criteria and student visa support.',
  },
  'resource-hub': {
    title: 'Resource Hub',
    description: 'Guides, checklists and resources for study abroad applicants.',
  },
  'partner-institutions': {
    title: 'Partner Institutions',
    description: 'Universities and colleges we partner with around the world.',
  },
  'faqs': {
    title: 'Frequently Asked Questions',
    description: 'Common questions about admissions, visas and studying abroad.',
  },
  'recruitment-partners': {
    title: 'Recruitment Partners',
    description: 'Partner with JnS Education as a recruitment agent.',
  },
  'careers': {
    title: 'Careers',
    description: 'Join the JnS Education team.',
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    description: 'How we collect, use and protect your personal information.',
  },
  'terms-and-conditions': {
    title: 'Terms and Conditions',
    description: 'Terms governing use of the JnS Education website and services.',
  },
  sitemap: {
    title: 'Sitemap',
    description: 'Navigate the JnS Education website.',
  },
  support: {
    title: 'Support',
    description: 'Get help from the JnS Education support team.',
  },
};

export const dynamic = 'force-dynamic';

async function resolveSlug(params: { slug: unknown }): Promise<string[]> {
  const maybe = params as { slug: unknown } | PromiseLike<{ slug: unknown }>;
  const resolved = await (typeof (maybe as { then?: unknown }).then !== 'undefined'
    ? ((maybe as unknown) as Promise<{ slug: unknown }>)
    : Promise.resolve(maybe));
  const slug = resolved && typeof resolved === 'object' ? (resolved as { slug?: unknown }).slug : undefined;
  return Array.isArray(slug) ? slug : [];
}

export async function metadata(params: { slug: unknown }): Promise<Metadata> {
  const slug = await resolveSlug(params);
  const first = slug[0];
  const section = SECTIONS[first];
  return {
    title: section ? `${section.title} | JnS Education` : 'Page not found | JnS Education',
    description: section?.description ?? 'The requested page could not be found.',
  };
}

export default async function CatchAllPage({ params }: { params: { slug: unknown } }) {
  const slug = await resolveSlug(params);
  const first = slug[0];
  const section = SECTIONS[first];

  if (!section) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-600">We couldn’t find the page you’re looking for.</p>
        <Link href="/" className="mt-4 inline-block text-primary underline">
          Return to homepage
        </Link>
      </div>
    );
  }

  return (
    <section className="py-16 lg:py-24">
      <PageHero
        title={section.title}
        bgImage="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80"
      />
      <div className="max-w-4xl mx-auto px-6">
        <p className="text-lg text-slate-700 leading-relaxed">{section.description}</p>
        <p className="mt-4 text-slate-600">
          Detailed content for <code className="font-mono">{slug.join('/')}</code> is coming soon.
        </p>
      </div>
    </section>
  );
}
