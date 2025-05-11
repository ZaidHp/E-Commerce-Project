import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiLinkedin } from 'react-icons/fi';
import { FaPinterestP } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Shop',
      links: [
        { name: 'New Arrivals', url: '/new-arrivals' },
        { name: 'Best Sellers', url: '/best-sellers' },
        { name: 'Sale', url: '/sale' },
        { name: 'Gift Cards', url: '/gift-cards' },
      ],
    },
    {
      title: 'Customer Service',
      links: [
        { name: 'Contact Us', url: '/contact' },
        { name: 'FAQs', url: '/faqs' },
        { name: 'Shipping & Returns', url: '/shipping-returns' },
        { name: 'Size Guide', url: '/size-guide' },
      ],
    },
    {
      title: 'About',
      links: [
        { name: 'Our Story', url: '/' },
        { name: 'Sustainability', url: '/sustainability' },
        { name: 'Careers', url: '/careers' },
        { name: 'Blog', url: '/blog' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms & Conditions', url: '/terms' },
        { name: 'Privacy Policy', url: '/privacy' },
        { name: 'Cookie Policy', url: '/cookies' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <FiFacebook size={18} />, url: 'https://facebook.com/fabrIQ' },
    { icon: <FiTwitter size={18} />, url: 'https://twitter.com/fabrIQ' },
    { icon: <FiInstagram size={18} />, url: 'https://instagram.com/fabrIQ' },
    { icon: <FiYoutube size={18} />, url: 'https://youtube.com/fabrIQ' },
    { icon: <FaPinterestP size={18} />, url: 'https://pinterest.com/fabrIQ' },
    { icon: <FiLinkedin size={18} />, url: 'https://linkedin.com/company/fabrIQ' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Newsletter Subscription */}
          <div className="lg:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4">Join the fabrIQ Community</h3>
            <p className="mb-4 text-gray-400">
              Subscribe to our newsletter for exclusive offers, styling tips, and new arrivals.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
              >
                Subscribe
              </button>
            </form>
            <div className="mt-6">
              <h4 className="text-white text-sm font-semibold mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.url.split('.com/')[1]}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="text-white text-lg font-bold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.url}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h4 className="text-white text-sm font-semibold mb-3">We Accept</h4>
          <div className="flex flex-wrap gap-3">
            {['visa', 'mastercard', 'paypal'].map((method) => ( //, 'apple-pay', 'google-pay'  'amex',
              <div
                key={method}
                className="h-8 w-12 bg-gray-800 rounded-md flex items-center justify-center"
              >
                <img
                  src={`https://logo.clearbit.com/${method}.com`}
                  alt={method}
                  className="h-4 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/48x32?text=${method}`;
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} fabrIQ. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;