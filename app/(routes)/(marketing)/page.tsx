import Link from 'next/link';
import Image from 'next/image';

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Digital Menus Made Simple
              </h1>
              <p className="mt-6 text-xl">
                Create beautiful digital menus for your restaurant in minutes. Update dish availability in real-time, offer multiple languages, and delight your customers.
              </p>
              <div className="mt-10 flex gap-4">
                <Link
                  href="/auth/register"
                  className="rounded-md bg-white px-6 py-3 text-base font-medium text-primary-600 shadow-sm hover:bg-gray-100"
                >
                  Get Started
                </Link>
                <Link
                  href="/#features"
                  className="rounded-md border border-white px-6 py-3 text-base font-medium text-white hover:bg-primary-700"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative h-[400px] w-full rounded-lg bg-white/10 p-4 shadow-xl">
                <div className="absolute inset-0 m-2 rounded-lg bg-white/80 p-4">
                  <div className="h-full w-full rounded-lg bg-white shadow-lg">
                    <div className="p-4">
                      <div className="h-8 w-32 rounded-full bg-primary-100"></div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="h-24 rounded-lg bg-gray-100"></div>
                        <div className="h-24 rounded-lg bg-gray-100"></div>
                        <div className="h-24 rounded-lg bg-gray-100"></div>
                        <div className="h-24 rounded-lg bg-gray-100"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose MenúFácil?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to create and manage digital menus for your restaurant.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg border p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6 text-primary-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Multi-Language Support</h3>
              <p className="mt-2 text-gray-600">
                Offer your menu in multiple languages to cater to all your customers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6 text-primary-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Real-Time Updates</h3>
              <p className="mt-2 text-gray-600">
                Update dish availability in real-time with a single click.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6 text-primary-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Beautiful Templates</h3>
              <p className="mt-2 text-gray-600">
                Choose from a variety of professionally designed templates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              One flat fee per restaurant. No hidden costs.
            </p>
          </div>
          <div className="mt-16 flex justify-center">
            <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900">Restaurant Plan</h3>
              <p className="mt-4 text-gray-600">
                Everything you need to create and manage digital menus for your restaurant.
              </p>
              <div className="mt-8">
                <span className="text-5xl font-bold tracking-tight text-gray-900">$20</span>
                <span className="text-base font-medium text-gray-500">/month per restaurant</span>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="ml-3 text-base text-gray-500">Unlimited menu items</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="ml-3 text-base text-gray-500">Multi-language support</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="ml-3 text-base text-gray-500">Real-time dish availability</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="ml-3 text-base text-gray-500">Multiple menu templates</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="ml-3 text-base text-gray-500">Customer engagement analytics</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  href="/auth/register"
                  className="block w-full rounded-md bg-primary-600 px-4 py-3 text-center text-base font-medium text-white shadow-sm hover:bg-primary-700"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What Our Customers Say
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Don't just take our word for it. Here's what restaurant owners have to say.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="rounded-lg border p-6 shadow-sm">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Maria Rodriguez</h3>
                  <p className="text-gray-600">La Cocina Mexicana</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "MenúFácil has transformed how we present our menu to customers. The multi-language support is perfect for our international clientele."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-lg border p-6 shadow-sm">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">John Smith</h3>
                  <p className="text-gray-600">The Grill House</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "Being able to update dish availability in real-time has reduced customer frustration and improved our service efficiency."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="rounded-lg border p-6 shadow-sm">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Akiko Tanaka</h3>
                  <p className="text-gray-600">Sakura Sushi</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "The beautiful templates make our menu look professional and appetizing. Our customers love the digital experience."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to transform your restaurant's menu?
          </h2>
          <p className="mt-4 text-lg">
            Join thousands of restaurants already using MenúFácil.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/register"
              className="inline-block rounded-md bg-white px-6 py-3 text-base font-medium text-primary-600 shadow-sm hover:bg-gray-100"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 