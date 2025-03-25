'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';

// UI Components
import Button from '@/app/components/ui/button';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Refs for scroll animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  const testimonialsRef = useRef(null);
  const faqRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: false });
  const featuresInView = useInView(featuresRef, { once: false });
  const pricingInView = useInView(pricingRef, { once: false });
  const testimonialsInView = useInView(testimonialsRef, { once: false });
  const faqInView = useInView(faqRef, { once: false });
  
  const heroControls = useAnimation();
  const featuresControls = useAnimation();
  const pricingControls = useAnimation();
  const testimonialsControls = useAnimation();
  const faqControls = useAnimation();
  
  useEffect(() => {
    if (heroInView) heroControls.start('visible');
    if (featuresInView) featuresControls.start('visible');
    if (pricingInView) pricingControls.start('visible');
    if (testimonialsInView) testimonialsControls.start('visible');
    if (faqInView) faqControls.start('visible');
    
    // Add smooth scrolling behavior
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const targetElement = document.querySelector(href);
          if (targetElement) {
            setIsMenuOpen(false);
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };
    
    document.addEventListener('click', handleSmoothScroll);
    return () => document.removeEventListener('click', handleSmoothScroll);
  }, [heroInView, featuresInView, pricingInView, testimonialsInView, faqInView, heroControls, featuresControls, pricingControls, testimonialsControls, faqControls]);

  return (
    <div className="min-h-screen font-sans bg-white overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white fixed w-full z-50 shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-brand-primary rounded-md flex items-center justify-center text-white font-bold text-xl">M</div>
              <span className="ml-2 text-xl font-bold text-brand-primary">MenúFácil</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/#features" className="text-brand-text hover:text-brand-accent px-3 py-2 rounded-md text-sm font-medium transition duration-250">
                Features
              </Link>
              <Link href="/#pricing" className="text-brand-text hover:text-brand-accent px-3 py-2 rounded-md text-sm font-medium transition duration-250">
                Pricing
              </Link>
              <Link href="/#testimonials" className="text-brand-text hover:text-brand-accent px-3 py-2 rounded-md text-sm font-medium transition duration-250">
                Testimonials
              </Link>
              <Link href="/#faq" className="text-brand-text hover:text-brand-accent px-3 py-2 rounded-md text-sm font-medium transition duration-250">
                FAQ
              </Link>
              <Link href="/about" className="text-brand-text hover:text-brand-accent px-3 py-2 rounded-md text-sm font-medium transition duration-250">
                About
              </Link>
              <Link href="/contact" className="text-brand-text hover:text-brand-accent px-3 py-2 rounded-md text-sm font-medium transition duration-250">
                Contact
              </Link>
              <Link href="/auth/login" className="ml-2">
                <Button variant="outline" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/register" className="ml-2">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-brand-primary hover:text-brand-accent focus:outline-none"
              >
                <svg 
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg 
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link href="/#features" className="text-brand-text hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium">
                  Features
                </Link>
                <Link href="/#pricing" className="text-brand-text hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium">
                  Pricing
                </Link>
                <Link href="/#testimonials" className="text-brand-text hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium">
                  Testimonials
                </Link>
                <Link href="/#faq" className="text-brand-text hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium">
                  FAQ
                </Link>
                <Link href="/about" className="text-brand-text hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium">
                  About
                </Link>
                <Link href="/contact" className="text-brand-text hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium">
                  Contact
                </Link>
                <Link href="/auth/login" className="block w-full px-3 py-2">
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/register" className="block w-full px-3 py-2">
                  <Button className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        id="hero"
        initial="hidden"
        animate={heroControls}
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.8, 
              ease: "easeOut",
              staggerChildren: 0.2 
            } 
          }
        }}
        className="pt-32 pb-20 bg-gradient-to-br from-brand-primary via-accent-500 to-brand-secondary text-white relative"
      >
        {/* Floating Elements Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              y: [0, -15, 0],
              x: [0, 10, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute top-20 left-[10%] w-24 h-24 rounded-full bg-white/10"
          />
          <motion.div 
            animate={{ 
              y: [0, 15, 0],
              x: [0, -10, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute bottom-16 right-[15%] w-32 h-32 rounded-full bg-white/10"
          />
          <motion.div 
            animate={{ 
              y: [0, 20, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute top-1/2 left-[30%] w-40 h-40 rounded-full bg-white/5"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
              }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
                Digital Menus <span className="text-brand-neutral">Made Simple</span>
              </h1>
              <p className="text-lg sm:text-xl max-w-3xl mb-8">
                Create beautiful digital menus for your restaurant in minutes. No technical skills required.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/auth/register">
                  <Button 
                    size="lg" 
                    className="bg-white !text-brand-primary hover:!bg-brand-primary hover:!text-white transform hover:scale-105 transition duration-250 font-bold"
                    aria-label="Start free trial - no credit card required"
                  >
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/about">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white/10 transform hover:scale-105 transition duration-250"
                    aria-label="Learn more about our services"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
              
              {/* Features highlights */}
              <div className="flex flex-wrap gap-4 mt-8 text-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-brand-neutral" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Easy Setup</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-brand-neutral" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>QR Code Access</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-brand-neutral" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Real-time Updates</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
              }}
              className="relative md:ml-auto"
            >
              <div className="bg-white rounded-2xl shadow-2xl-brand overflow-hidden">
                <div className="relative w-full h-[500px] bg-gray-100 flex items-center justify-center">
                  {/* Placeholder for menu mockup image */}
                  <div className="p-4 bg-white rounded-lg shadow-lg transform rotate-3 w-64 h-96">
                    <div className="h-12 flex items-center justify-center border-b border-gray-200">
                      <div className="w-32 h-6 bg-brand-primary rounded-md"></div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                    <div className="mt-8">
                      <div className="h-20 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-5 -right-5 p-4 bg-white rounded-lg shadow-lg transform -rotate-6 w-56 h-72">
                    <div className="h-8 flex items-center justify-center border-b border-gray-200">
                      <div className="w-24 h-4 bg-brand-secondary rounded-md"></div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="mt-6">
                      <div className="h-16 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </div>
                  
                  {/* Phone frame */}
                  <div className="absolute -bottom-10 -left-5 w-40 h-80 bg-brand-primary rounded-3xl border-8 border-white shadow-xl transform rotate-6">
                    <div className="bg-black h-full w-full rounded-2xl overflow-hidden p-2 flex flex-col">
                      <div className="h-2 bg-brand-primary rounded-full mb-2"></div>
                      <div className="flex-1 bg-white rounded-lg p-2">
                        <div className="h-4 w-20 bg-brand-primary rounded-md mb-2"></div>
                        <div className="space-y-1">
                          <div className="h-2 bg-gray-200 rounded w-full"></div>
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded w-full mt-3"></div>
                        <div className="h-10 bg-gray-200 rounded w-full mt-2"></div>
                        <div className="h-10 bg-gray-200 rounded w-full mt-2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* QR code example */}
              <div className="absolute -right-4 -bottom-4 bg-white p-3 rounded-lg shadow-lg transform rotate-6">
                <div className="w-24 h-24 bg-gray-200 rounded grid grid-cols-5 grid-rows-5 gap-1 p-2">
                  <div className="col-span-2 row-span-2 bg-brand-primary rounded-sm"></div>
                  <div className="col-span-2 row-span-2 bg-brand-primary rounded-sm col-start-4 row-start-1"></div>
                  <div className="col-span-2 row-span-2 bg-brand-primary rounded-sm col-start-1 row-start-4"></div>
                  <div className="col-span-1 row-span-1 bg-brand-primary rounded-sm col-start-3 row-start-3"></div>
                  <div className="col-span-1 row-span-3 bg-brand-primary rounded-sm col-start-5 row-start-3"></div>
                </div>
                <div className="text-xs text-center text-brand-primary mt-1 font-medium">Scan Me</div>
              </div>
            </motion.div>
          </div>
          
          {/* Stats section */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4 } }
            }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">300+</div>
              <div className="text-sm">Restaurants</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">15K+</div>
              <div className="text-sm">Menu Items</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">99%</div>
              <div className="text-sm">Satisfaction</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">30%</div>
              <div className="text-sm">Sales Increase</div>
            </div>
          </motion.div>
        </div>
        
        {/* New wave divider directly inside the hero section */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-0" style={{ transform: 'translateY(1px)' }}>
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-full h-[60px] md:h-[80px]" 
            fill="#ffffff"
            aria-hidden="true"
          >
            <motion.path 
              d="M0,0 L1200,0 L1200,120 L0,120 L0,0 Z M0,40 C200,100 400,10 600,80 C800,150 1000,60 1200,90 L1200,0 L0,0 Z"
              fillRule="evenodd"
              animate={{
                d: [
                  "M0,0 L1200,0 L1200,120 L0,120 L0,0 Z M0,40 C200,100 400,10 600,80 C800,150 1000,60 1200,90 L1200,0 L0,0 Z",
                  "M0,0 L1200,0 L1200,120 L0,120 L0,0 Z M0,60 C200,20 400,100 600,40 C800,-20 1000,80 1200,50 L1200,0 L0,0 Z",
                  "M0,0 L1200,0 L1200,120 L0,120 L0,0 Z M0,40 C200,100 400,10 600,80 C800,150 1000,60 1200,90 L1200,0 L0,0 Z"
                ],
                transition: {
                  duration: 20,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }}
            />
          </svg>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features"
        ref={featuresRef}
        initial="hidden"
        animate={featuresControls}
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1, 
            transition: { 
              staggerChildren: 0.2,
              duration: 0.5
            } 
          }
        }}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              className="text-3xl sm:text-4xl font-bold text-brand-primary mb-4"
            >
              Why Choose MenúFácil?
            </motion.h2>
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }
              }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              Our platform makes it easy to create, update and manage beautiful digital menus that can be accessed by your customers via QR codes or direct links.
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              className="bg-white rounded-xl shadow-lg p-6 transform hover:-translate-y-2 transition duration-300"
            >
              <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">Easy to Use</h3>
              <p className="text-gray-600">Create and update your digital menu in minutes with our intuitive interface. No technical skills required.</p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } }
              }}
              className="bg-white rounded-xl shadow-lg p-6 transform hover:-translate-y-2 transition duration-300"
            >
              <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Update your menu instantly. Mark items as unavailable in real-time without reprinting menus.</p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } }
              }}
              className="bg-white rounded-xl shadow-lg p-6 transform hover:-translate-y-2 transition duration-300"
            >
              <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-primary mb-2">Beautiful Images</h3>
              <p className="text-gray-600">Showcase your dishes with high-quality images. Help customers visualize your food before ordering.</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        id="pricing"
        ref={pricingRef}
        initial="hidden"
        animate={pricingControls}
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1, 
            transition: { 
              staggerChildren: 0.2,
              duration: 0.5
            } 
          }
        }}
        className="py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              className="text-3xl sm:text-4xl font-bold text-brand-primary mb-4"
            >
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }
              }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              No hidden fees. No long-term contracts. Just a simple subscription that aligns with your business.
            </motion.p>
          </div>
          
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
            }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-lg mx-auto"
          >
            <div className="bg-gradient-to-r from-brand-primary to-accent-500 px-8 py-6 text-white">
              <h3 className="text-2xl font-bold">Standard Plan</h3>
              <p className="opacity-90">Everything you need to digitize your menu</p>
            </div>
            <div className="p-8">
              <div className="flex items-baseline mb-8">
                <span className="text-5xl font-extrabold text-brand-primary">$20</span>
                <span className="text-xl text-gray-500 ml-2">/month per restaurant</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Unlimited menus</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Real-time availability updates</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Custom QR codes</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Multiple menu templates</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Customer engagement analytics</span>
                </li>
              </ul>
              <Link href="/auth/register" className="block">
                <Button className="w-full">
                  Start Your Free Trial
                </Button>
              </Link>
              <p className="text-xs text-center text-gray-500 mt-4">No credit card required to start</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        id="testimonials"
        ref={testimonialsRef}
        initial="hidden"
        animate={testimonialsControls}
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1, 
            transition: { 
              staggerChildren: 0.2,
              duration: 0.5
            } 
          }
        }}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              className="text-3xl sm:text-4xl font-bold text-brand-primary mb-4"
            >
              What Our Customers Say
            </motion.h2>
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }
              }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              Don&apos;t just take our word for it - hear what restaurant owners have to say about MenuFácil.
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              className="bg-white rounded-xl shadow-lg p-8 transform hover:-translate-y-2 transition duration-300 border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-xl">R</div>
                <div className="ml-4">
                  <h4 className="font-semibold text-brand-primary">Ricardo Montalbán</h4>
                  <p className="text-sm text-gray-500">El Sabor Restaurant</p>
                </div>
              </div>
              <div className="flex text-accent mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic">&quot;Since implementing MenuFácil, we&apos;ve seen a 30% increase in orders for items with images. The QR code system is seamless, and updating our menu is incredibly simple.&quot;</p>
            </motion.div>
            
            {/* Testimonial 2 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } }
              }}
              className="bg-white rounded-xl shadow-lg p-8 transform hover:-translate-y-2 transition duration-300 border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-xl">C</div>
                <div className="ml-4">
                  <h4 className="font-semibold text-brand-primary">Carmen Rodriguez</h4>
                  <p className="text-sm text-gray-500">Café Madrigal</p>
                </div>
              </div>
              <div className="flex text-accent mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic">&quot;The customer analytics have been game-changing for our business. We now know which menu categories perform best and can make data-driven decisions about our offerings.&quot;</p>
            </motion.div>
            
            {/* Testimonial 3 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } }
              }}
              className="bg-white rounded-xl shadow-lg p-8 transform hover:-translate-y-2 transition duration-300 border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-xl">M</div>
                <div className="ml-4">
                  <h4 className="font-semibold text-brand-primary">Miguel Fernandez</h4>
                  <p className="text-sm text-gray-500">Tapas & Vino</p>
                </div>
              </div>
              <div className="flex text-accent mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic">&quot;Our customers love being able to scan the QR code and browse our full menu with photos and descriptions. The monthly cost is easily offset by the reduction in printed menu expenses.&quot;</p>
            </motion.div>
          </div>
          
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.4 } }
            }}
            className="mt-12 text-center"
          >
            <Link href="/auth/register">
              <Button size="lg" className="transform hover:scale-105 transition duration-250 shadow-lg">
                Join Satisfied Customers
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        id="faq"
        ref={faqRef}
        initial="hidden"
        animate={faqControls}
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1, 
            transition: { 
              staggerChildren: 0.2,
              duration: 0.5
            } 
          }
        }}
        className="py-20 bg-gray-50"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              id="faq-heading"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              className="text-3xl sm:text-4xl font-bold text-brand-primary mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }
              }}
              className="text-lg text-gray-600"
            >
              Got questions? We've got answers.
            </motion.p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition duration-300">
              <h3 className="text-xl font-semibold text-brand-primary mb-2">How quickly can I get started?</h3>
              <p className="text-gray-600">You can create your first digital menu in as little as 15 minutes. Our intuitive interface lets you add items, organize categories, and customize the appearance without any technical skills.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition duration-300">
              <h3 className="text-xl font-semibold text-brand-primary mb-2">Can I try before I subscribe?</h3>
              <p className="text-gray-600">Absolutely! We offer a 14-day free trial with full access to all features. No credit card required to start.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition duration-300">
              <h3 className="text-xl font-semibold text-brand-primary mb-2">How do customers access my digital menu?</h3>
              <p className="text-gray-600">Customers can access your menu by scanning a QR code displayed at your restaurant or through a direct link that you can share on your website and social media.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition duration-300">
              <h3 className="text-xl font-semibold text-brand-primary mb-2">Can I update menu items in real-time?</h3>
              <p className="text-gray-600">Yes! You can instantly update prices, descriptions, and availability. Changes appear immediately on your digital menu, allowing you to mark items as sold out or change specials on the fly.</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Updated CTA Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
        className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mb-16"
      >
        <motion.div
          className="bg-gradient-to-br from-brand-primary via-accent-500 to-brand-secondary text-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ y: 0, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
          animate={{ 
            boxShadow: ["0 10px 25px rgba(0, 0, 0, 0.1)", "0 20px 25px rgba(0, 0, 0, 0.2)", "0 10px 25px rgba(0, 0, 0, 0.1)"],
            y: [0, -3, 0],
          }}
          transition={{ 
            boxShadow: { 
              repeat: Infinity, 
              duration: 3, 
              repeatType: "reverse", 
              ease: "easeInOut" 
            },
            y: { 
              repeat: Infinity, 
              duration: 3, 
              repeatType: "reverse", 
              ease: "easeInOut" 
            }
          }}
          whileHover={{ 
            boxShadow: "0 25px 30px rgba(0, 0, 0, 0.25)",
            transition: { duration: 0.3 }
          }}
        >
          <div className="py-12 px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Transform Your Restaurant Menu?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">Join hundreds of restaurants already using MenuFácil to create beautiful digital menus that customers love.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/register">
                <Button 
                  size="lg" 
                  className="bg-white !text-brand-primary hover:!bg-brand-primary hover:!text-white transform hover:scale-105 transition duration-250 font-bold px-8 shadow-lg"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 transform hover:scale-105 transition duration-250 px-8"
                >
                  Schedule Demo
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm opacity-80">No credit card required • 14-day free trial • Full access to all features</p>
          </div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-brand-primary text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center text-brand-primary font-bold text-xl">M</div>
                <span className="ml-2 text-xl font-bold">MenúFácil</span>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Digital menus made simple for restaurants of all sizes.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition duration-250">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition duration-250">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition duration-250">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/#features" className="text-gray-300 hover:text-white transition duration-250">Features</Link></li>
                <li><Link href="/#pricing" className="text-gray-300 hover:text-white transition duration-250">Pricing</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition duration-250">Request Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-300 hover:text-white transition duration-250">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition duration-250">Contact</Link></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition duration-250">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition duration-250">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition duration-250">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-sm text-gray-400 text-center">
            <p>&copy; {new Date().getFullYear()} MenúFácil. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 