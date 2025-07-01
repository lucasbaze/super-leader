import Link from 'next/link';

import { Bitcoin } from '@/components/icons';
import { Logo } from '@/components/marketing/logo';
import { ROUTES } from '@/lib/routes';

export default function BitcoinPage() {
  return (
    <div className='min-h-screen bg-white'>
      <div className='mx-auto max-w-4xl px-6 py-12'>
        <div className='mb-12'>
          <Link href={ROUTES.HOME}>
            <Logo />
          </Link>
        </div>

        <div className='space-y-8 text-gray-700'>
          <div className='mb-8 flex items-center gap-3'>
            <Bitcoin size={48} className='text-orange-500' />
            <h1 className='text-4xl font-bold'>Backed by Bitcoin</h1>
          </div>

          <p className='mb-8 text-xl leading-relaxed text-gray-600'>
            At Superleader, being "backed by Bitcoin" isn't just a slogan—it's our fundamental commitment to building a
            product that will last forever, operate with complete transparency, and put your data ownership first.
          </p>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>What "Backed by Bitcoin" Means</h2>
            <p className='mb-4'>
              When we say we're backed by Bitcoin, we mean that our company operates with Bitcoin as our treasury and
              monetary system. This ensures that Superleader will live forever by:
            </p>
            <ul className='mb-4 ml-6 list-disc space-y-2'>
              <li>Using Bitcoin as our primary store of value and treasury asset</li>
              <li>Accepting payments in Bitcoin from customers who prefer it</li>
              <li>Ensuring long-term sustainability through sound money principles</li>
            </ul>
            <p>
              This isn't just about Bitcoin—it's about adopting a monetary system that aligns with our values of
              permanence, transparency, and user ownership.
            </p>
          </section>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>The Bitcoin Thesis</h2>
            <p className='mb-4'>
              Our commitment to Bitcoin is rooted in its fundamental properties that make it the hardest money in the
              world:
            </p>
            <ul className='mb-4 ml-6 list-disc space-y-3'>
              <li>
                <strong>Decentralized:</strong> No single entity controls Bitcoin, making it resistant to manipulation
                or shutdown
              </li>
              <li>
                <strong>No Third Parties:</strong> Bitcoin operates without intermediaries, reducing counterparty risk
              </li>
              <li>
                <strong>Seizure Resistant:</strong> Properly stored Bitcoin cannot be confiscated or frozen by any
                authority
              </li>
              <li>
                <strong>Finite Supply:</strong> With only 21 million Bitcoin ever to exist, it preserves value over time
              </li>
            </ul>
            <p>
              These properties ensure that our treasury remains secure and that we can plan for the very long
              term—decades and beyond.
            </p>
          </section>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>Our Operating Philosophy</h2>
            <p className='mb-4'>Because we're backed by Bitcoin, we operate on first principles:</p>
            <ul className='mb-4 ml-6 list-disc space-y-3'>
              <li>
                <strong>Sustainable Growth:</strong> We're not chasing hyper-growth or burning cash. We build steadily
                and sustainably.
              </li>
              <li>
                <strong>Fully Bootstrapped:</strong> We've never taken VC money and never will. This means we answer
                only to our users, not investors.
              </li>
              <li>
                <strong>Built to Last Forever:</strong> Every decision is made with decades in mind, not quarters.
              </li>
              <li>
                <strong>Never Selling Out:</strong> We will never sell to VCs, shut down your accounts, or compromise on
                our principles.
              </li>
            </ul>
            <p>
              This approach ensures that Superleader will be here for you not just next year, but for the next several
              decades.
            </p>
          </section>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>Your Data, Your Ownership</h2>
            <p className='mb-4'>
              Just like Bitcoin operates on the principle of "your keys, your Bitcoin," we believe in "your data, your
              ownership." This means:
            </p>
            <ul className='mb-4 ml-6 list-disc space-y-2'>
              <li>You own your relationship data and can export it anytime</li>
              <li>We don't sell your data to third parties</li>
              <li>Our business model is simple: you pay us, we serve you</li>
              <li>No hidden revenue streams or data monetization schemes</li>
            </ul>
            <p>
              You can trust that we will be around for a very, very long time because our incentives are perfectly
              aligned with yours.
            </p>
          </section>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>Why Bitcoin and Relationships Align</h2>
            <p className='mb-4'>
              Bitcoin and relationship building share a fundamental philosophy: both are about long-term thinking and
              compound value.
            </p>
            <ul className='mb-4 ml-6 list-disc space-y-3'>
              <li>
                <strong>Long-term Planning:</strong> Bitcoin allows you to plan decades into the future. Similarly,
                meaningful relationships are built over years and decades, not days or weeks.
              </li>
              <li>
                <strong>Compound Value:</strong> Just as Bitcoin's value compounds over time, relationships become more
                valuable the longer you nurture them.
              </li>
              <li>
                <strong>First Principles:</strong> Bitcoin strips away the complexity of traditional finance. Great
                relationships strip away superficiality to focus on genuine connection.
              </li>
              <li>
                <strong>Personal Sovereignty:</strong> Bitcoin gives you monetary sovereignty. Strong relationships give
                you social and emotional sovereignty.
              </li>
            </ul>
            <p>
              This alignment isn't coincidental—it's why we believe Bitcoiners will find tremendous value in
              Superleader.
            </p>
          </section>

          <section>
            <h2 className='mb-4 text-2xl font-semibold'>Calling All Bitcoiners</h2>
            <p className='mb-4'>If you're a Bitcoiner, we'd love to connect with you. Whether you want to:</p>
            <ul className='mb-4 ml-6 list-disc space-y-2'>
              <li>Try Superleader and give us feedback</li>
              <li>Help us build features that serve the Bitcoin community</li>
              <li>Discuss how relationship building and Bitcoin philosophy intersect</li>
              <li>Pay for your subscription in Bitcoin</li>
            </ul>
            <p className='mb-4'>
              We believe that the Bitcoin community understands the value of long-term thinking, personal sovereignty,
              and building something that lasts. These are exactly the principles that make great relationships—and
              great products.
            </p>
            <p>
              Reach out to us at{' '}
              <a href='mailto:lucas@superleader.ai' className='text-orange-500 underline hover:text-orange-600'>
                lucas@superleader.ai
              </a>{' '}
              if you'd like to be part of this journey.
            </p>
          </section>

          <section className='mt-12 rounded-r-lg border-l-4 border-orange-500 bg-orange-50 p-6'>
            <div className='flex items-start gap-3'>
              <Bitcoin size={24} className='mt-1 text-orange-500' />
              <div>
                <h3 className='mb-2 text-lg font-semibold text-gray-900'>Our Promise</h3>
                <p className='text-gray-700'>
                  Just as Bitcoin has operated reliably for over 15 years without downtime, we're building Superleader
                  to operate reliably for decades. Your relationships are too important to trust to a company that might
                  disappear, pivot, or sell out. With Bitcoin backing us, you can rest assured that we'll be here for
                  the long haul.
                </p>
              </div>
            </div>
          </section>

          <section className='mt-8 border-t pt-8'>
            <p className='text-gray-700'>
              Ready to build relationships that compound over time?{' '}
              <Link href={ROUTES.HOME} className='font-medium text-orange-500 underline hover:text-orange-600'>
                Join the Superleader waitlist
              </Link>{' '}
              and be part of a platform built to last forever.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
