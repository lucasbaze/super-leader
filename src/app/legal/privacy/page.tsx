import Link from 'next/link';

import { Logo } from '@/components/marketing/logo';
import { ROUTES } from '@/lib/routes';

export default function Privacy() {
  return (
    <div className='min-h-screen bg-white'>
      <div className='mx-auto max-w-4xl px-6 py-12'>
        <div className='mb-12'>
          <Link href={ROUTES.HOME}>
            <Logo />
          </Link>
        </div>

        <div className='space-y-8 text-gray-700'>
          <h1 className='mb-2 text-4xl font-bold'>Privacy Policy</h1>
          <p className='text-gray-500'>Last Updated: July 1, 2025</p>

          <p className='mb-8'>
            At SuperLeader, we respect your privacy and are committed to protecting the personal information you share
            with us. This Privacy Policy explains how we collect, use, store, and share information when you access or
            use our website, application, and related services (the "Services").
          </p>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>1. Information We Collect</h2>
            <p className='mb-4'>
              We collect personal and service-related information when you use SuperLeader, including:
            </p>
            <ul className='ml-6 list-disc space-y-2'>
              <li>Personal identifiers: name, email address, social handles</li>
              <li>Social and professional data: messages, notes, social profiles, calendar events</li>
              <li>
                Connected account data: information retrieved from Gmail, Outlook, Twitter, Calendly, and other
                integrated services
              </li>
              <li>Activity data: AI prompts, responses, and usage patterns</li>
            </ul>
            <p className='mt-4'>We do not actively log IP addresses or device-level metadata.</p>
          </section>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>2. Use of Information</h2>
            <p className='mb-4'>We use the information we collect to:</p>
            <ul className='ml-6 list-disc space-y-2'>
              <li>Provide and maintain the Services</li>
              <li>Analyze and improve features and functionality</li>
              <li>Troubleshoot bugs and provide customer support</li>
              <li>Enable integrations with third-party services</li>
              <li>Secure and monitor platform performance</li>
            </ul>
            <p className='mt-4'>Your content is never used to train our models.</p>
          </section>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>3. AI and Data Retention</h2>
            <p>
              AI conversations and prompts are stored and may be reviewed to improve service reliability, fix bugs, and
              ensure quality. This data may be retained indefinitely, unless a user requests deletion.
            </p>
          </section>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>4. Third-Party Services and Data Sharing</h2>
            <p className='mb-4'>We rely on select third-party services to operate SuperLeader:</p>
            <ul className='ml-6 list-disc space-y-2'>
              <li>OpenAI – natural language processing</li>
              <li>Supabase – database and authentication</li>
              <li>Vercel – application hosting and analytics</li>
              <li>Trigger.dev – background job automation (may store personal data in logs)</li>
            </ul>
            <p className='mt-4'>
              These vendors may process or store personal data to the extent required for service delivery. We do not
              currently use third-party marketing cookies or external tracking tools like Segment or Mixpanel.
            </p>
          </section>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>5. User Rights</h2>
            <p className='mb-4'>You may:</p>
            <ul className='ml-6 list-disc space-y-2'>
              <li>Request a copy of your data</li>
              <li>Delete your account and associated data</li>
              <li>Export your information</li>
              <li>Request the deletion of specific conversations or content</li>
            </ul>
            <p className='mt-4'>To exercise your rights, contact us at lucas@superleader.ai.</p>
          </section>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>6. Data Security</h2>
            <p className='mb-4'>
              All personal data is encrypted at rest and in transit. While no system is entirely secure, we use best
              practices to safeguard your information.
            </p>
            <p>We are not currently compliant with GDPR or CCPA regulations.</p>
          </section>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>7. Data Storage and Location</h2>
            <p>
              All data is stored in the United States through third-party platforms, including Vercel, OpenAI, and
              Supabase, which may be layered on top of providers such as AWS.
            </p>
          </section>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>8. Children's Privacy</h2>
            <p>
              SuperLeader is not intended for use by children under 13. We do not knowingly collect or store data from
              children.
            </p>
          </section>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>9. Changes to this Policy</h2>
            <p>
              We may update this Privacy Policy at any time. The latest version will always be available via our website
              and app. Continued use of the Services indicates your acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>10. Contact</h2>
            <p className='mb-4'>
              If you have questions or concerns about this Privacy Policy, or would like to submit a data request,
              please contact:
            </p>
            <p>
              Lucas
              <br />
              Email: lucas@superleader.ai
            </p>
          </section>

          <section className='mt-8 border-t pt-8'>
            <p className='text-gray-700'>By using SuperLeader, you agree to the terms of this Privacy Policy.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
