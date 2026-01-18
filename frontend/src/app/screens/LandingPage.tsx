import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Users, 
  MapPin, 
  Coffee, 
  BookOpen, 
  Heart, 
  ArrowRight,
  Sparkles,
  MessageCircle,
  Star,
  Plane,
  Camera,
  Music
} from 'lucide-react';
import FloatingPlane from '@/app/components/FloatingPlane';

interface LandingPageProps {
  onGetStarted: () => void;
}

const floatingIcons = [
  { Icon: Plane, delay: 0, x: '10%', y: '20%' },
  { Icon: Camera, delay: 0.5, x: '85%', y: '15%' },
  { Icon: Coffee, delay: 1, x: '75%', y: '60%' },
  { Icon: Music, delay: 1.5, x: '15%', y: '70%' },
  { Icon: BookOpen, delay: 2, x: '90%', y: '80%' },
  { Icon: MapPin, delay: 0.3, x: '5%', y: '45%' },
];

const testimonials = [
  {
    name: 'Sarah K.',
    location: 'Toronto, Canada',
    text: 'Found my study group and best friends through Travelmate!',
    avatar: 'S',
  },
  {
    name: 'Marco L.',
    location: 'Milan, Italy',
    text: 'Made connections that made my exchange semester unforgettable.',
    avatar: 'M',
  },
  {
    name: 'Yuki T.',
    location: 'Tokyo, Japan',
    text: 'Finally found people who get the international student experience!',
    avatar: 'Y',
  },
];

const features = [
  {
    icon: Users,
    title: 'Find Your People',
    description: 'Connect with people who share similar backgrounds and interests.',
    color: '#f55c7a',
  },
  {
    icon: Globe,
    title: 'Self Discovery',
    description: 'Discover your identity as you navigate unfamiliar places.',
    color: '#f57c73',
  },
  {
    icon: MapPin,
    title: 'Explore Your City',
    description: 'View and attend events happening near you.',
    color: '#f68c70',
  },
  {
    icon: Coffee,
    title: 'Real Meetups',
    description: 'Meet up in person with new friends.',
    color: '#f6ac69',
  },
];

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFEBDA] overflow-x-hidden">
      <FloatingPlane />
      {/* floating background icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingIcons.map(({ Icon, delay, x, y }, index) => (
          <motion.div
            key={index}
            className="absolute text-[#f55c7a]/10"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              opacity: { delay, duration: 0.5 },
              scale: { delay, duration: 0.5 },
              y: { delay: delay + 0.5, duration: 3, repeat: Infinity, ease: 'easeInOut' },
              rotate: { delay: delay + 0.5, duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <Icon size={48} strokeWidth={1.5} />
          </motion.div>
        ))}
      </div>

      {/* navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-[#f55c7a] rounded-full flex items-center justify-center border-2 border-black">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl text-black" style={{ fontFamily: 'Castoro, serif' }}>
              Travelmate
            </h1>
          </motion.div>

          <motion.button
            onClick={onGetStarted}
            className="px-6 py-2.5 bg-black text-white rounded-full font-medium flex items-center gap-2 hover:bg-black/80 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.nav>

      {/* hero section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* animated badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-[#f6ac69]" />
            <span className="text-sm font-medium">Community wherever you land</span>
          </motion.div>

          {/* main heading with gradient */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl leading-tight mb-6"
            style={{ fontFamily: 'Castoro, serif' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="block">Find Your</span>
            <motion.span 
              className="block bg-gradient-to-r from-[#f55c7a] via-[#f68c70] to-[#f6bc66] bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% auto' }}
            >
              Community
            </motion.span>
          </motion.h1>

          {/* subtitle */}
          <motion.p
            className="text-lg md:text-xl text-[#666666] max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            When the world feels unfamiliar, we help you find the people who feel like home.
          </motion.p>

          {/* cta buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              onClick={onGetStarted}
              className="group px-8 py-4 bg-[#f55c7a] text-white rounded-xl border-2 border-black font-semibold text-lg flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started Free
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={20} />
              </motion.div>
            </motion.button>
          </motion.div>

          {/* floating cards preview */}
          <motion.div 
            className="relative mt-16 h-[300px] md:h-[400px]"
            style={{
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
            }}
          >
            {/* card 1 */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-[280px] md:w-[320px] bg-white rounded-2xl border-2 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              initial={{ opacity: 0, y: 50, rotate: -5 }}
              animate={{ opacity: 1, y: 0, rotate: -5 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{ 
                top: '0%',
                left: '35%',
                zIndex: 3,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f55c7a] to-[#f6ac69] flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <p className="font-semibold">Alex Chen</p>
                  <p className="text-sm text-[#666666]">Exchange Student</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[#f55c7a]/10 text-[#f55c7a] rounded-full text-xs font-medium">Photography</span>
                <span className="px-3 py-1 bg-[#f6ac69]/10 text-[#f68c70] rounded-full text-xs font-medium">Food Tours</span>
                <span className="px-3 py-1 bg-[#f6bc66]/10 text-[#f6ac69] rounded-full text-xs font-medium">Hiking</span>
              </div>
            </motion.div>

            {/* card 2 */}
            <motion.div
              className="absolute w-[260px] md:w-[300px] bg-white rounded-2xl border-2 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              initial={{ opacity: 0, y: 50, rotate: 8 }}
              animate={{ opacity: 1, y: 0, rotate: 8 }}
              transition={{ duration: 0.8, delay: 1 }}
              style={{ 
                top: '15%',
                left: '55%',
                zIndex: 2,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f68c70] to-[#f6bc66] flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <p className="font-semibold">Maria Santos</p>
                  <p className="text-sm text-[#666666]">Digital Nomad</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[#f57c73]/10 text-[#f57c73] rounded-full text-xs font-medium">Coffee</span>
                <span className="px-3 py-1 bg-[#f55c7a]/10 text-[#f55c7a] rounded-full text-xs font-medium">Music</span>
              </div>
            </motion.div>

            {/* connection line animation */}
            <motion.div
              className="absolute top-[60%] left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <motion.div
                className="flex items-center gap-2 bg-[#f55c7a] text-white px-4 py-2 rounded-full border-2 border-black"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MessageCircle size={16} />
                <span className="text-sm font-medium">Let's explore together!</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-black rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 bg-black rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>


      {/* features section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: 'Castoro, serif' }}>
              Why Travelmate?
            </h2>
            <p className="text-[#666666] text-lg max-w-2xl mx-auto">
              Being abroad can be isolating, but also a great way to discover yourself. We want to make the process easier by helping you find community wherever you go, exploring the world while embracing your unique identity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group bg-white rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 border-2 border-black"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon size={28} style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                  {feature.title}
                </h3>
                <p className="text-[#666666]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* testimonials section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#f55c7a] to-[#f6ac69]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl text-white mb-4" style={{ fontFamily: 'Castoro, serif' }}>
              Real Stories, Real Connections
            </h2>
          </motion.div>

          <div className="relative h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-white rounded-2xl border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-lg text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#f6ac69] fill-[#f6ac69]" />
                    ))}
                  </div>
                  <p className="text-lg mb-4 italic">"{testimonials[currentTestimonial].text}"</p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f55c7a] to-[#f6ac69] flex items-center justify-center text-white font-bold">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{testimonials[currentTestimonial].name}</p>
                      <p className="text-sm text-[#666666]">{testimonials[currentTestimonial].location}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* testimonial dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full border-2 border-black transition-colors ${
                  index === currentTestimonial ? 'bg-white' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* how it works section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: 'Castoro, serif' }}>
              How It Works
            </h2>
            <p className="text-[#666666] text-lg">Three simple steps to find your travel friends</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Share your interests, travel style, and what kind of connections you\'re looking for.' },
              { step: '02', title: 'Discover People', desc: 'Our recommendation algorithm finds travelers and students who share your background and interests.' },
              { step: '03', title: 'Discover Yourself', desc: 'Connect, explore, and discover who you are abroad with support from our community.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="text-8xl font-bold text-[#f55c7a]/10 absolute -top-8 -left-4" style={{ fontFamily: 'Castoro, serif' }}>
                  {item.step}
                </div>
                <div className="relative bg-white rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                    {item.title}
                  </h3>
                  <p className="text-[#666666]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* final cta section */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-4xl mx-auto bg-black rounded-3xl p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(45deg, #f55c7a, #f68c70, #f6bc66, #f55c7a)',
              backgroundSize: '400% 400%',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <Globe className="w-16 h-16 text-[#f6ac69]" />
            </motion.div>

            <h2 className="text-3xl md:text-5xl text-white mb-4" style={{ fontFamily: 'Castoro, serif' }}>
              Ready to Find Your Community Abroad?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of travelers and students making meaningful connections every day.
            </p>

            <motion.button
              onClick={onGetStarted}
              className="px-10 py-4 bg-[#f55c7a] text-white rounded-xl border-2 border-white font-semibold text-lg flex items-center gap-3 mx-auto shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Journey
              <ArrowRight size={20} />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* footer */}
      <footer className="py-8 px-6 border-t-2 border-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f55c7a] rounded-full flex items-center justify-center border-2 border-black">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold" style={{ fontFamily: 'Castoro, serif' }}>Travelmate</span>
          </div>
          <p className="text-[#666666] text-sm">
            Built with love for travelers everywhere
          </p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="text-[#666666] hover:text-black transition-colors">Privacy</a>
            <a href="#" className="text-[#666666] hover:text-black transition-colors">Terms</a>
            <a href="#" className="text-[#666666] hover:text-black transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
