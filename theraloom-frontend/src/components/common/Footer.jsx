import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#122B21] text-[#FAF8F5] pt-14 pb-8 border-t border-[#19382C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#244E3E]/60">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#19382C] shadow-sm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="9" r="5" stroke="#19382C" strokeWidth="2" strokeDasharray="1 1" />
                  <circle cx="15" cy="15" r="5" stroke="#7D9D8B" strokeWidth="2" />
                  <path d="M9 14C11 12 13 12 15 10" stroke="#19382C" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-white">
                Theraloom
              </span>
            </Link>
            <p className="text-xs text-[#A9BDA9] leading-relaxed">
              Your practice, thoughtfully connected. The premier all-in-one practice management suite designed specifically for mental health professionals across India.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#E4ECE7]/80">
              <ShieldCheck className="w-4 h-4 text-[#7D9D8B]" />
              <span>Designed with Indian Healthcare Standards & MHCA 2017 Awareness</span>
            </div>
          </div>

          {/* Practice Management */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B] mb-3">
              For Practitioners
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F5]/80">
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Practice Profile
                </Link>
              </li>
              <li>
                <Link to="/#features" className="hover:text-white transition-colors">
                  Clinical SOAP / DAP Notes
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="hover:text-white transition-colors">
                  Plans & Entitlements
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Therapist Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clients */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B] mb-3">
              For Clients
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F5]/80">
              <li>
                <Link to="/#patterns" className="hover:text-white transition-colors">
                  Identify Your Pattern
                </Link>
              </li>
              <li>
                <Link to="/#directory" className="hover:text-white transition-colors">
                  Find Verified Clinicians
                </Link>
              </li>
              <li>
                <Link to="/#clarity-session" className="hover:text-white transition-colors text-emerald-300 font-semibold">
                  ₹299 Clarity Session
                </Link>
              </li>
              <li>
                <Link to="/#anti-guru" className="hover:text-white transition-colors">
                  The Clinical Standard (No Bypassing)
                </Link>
              </li>
              <li>
                <Link to="/portal" className="hover:text-white transition-colors">
                  Client Booking Portal
                </Link>
              </li>
              <li>
                <Link to="/#faq" className="hover:text-white transition-colors">
                  Straight Talk FAQs
                </Link>
              </li>
              <li>
                <Link to="/crisis" className="hover:text-rose-300 transition-colors font-medium text-rose-200">
                  Emergency Helplines (India 14416)
                </Link>
              </li>
            </ul>
          </div>

          {/* Indian Mental Health Crisis Support Notice */}
          <div className="bg-[#19382C] p-4 rounded-xl border border-[#244E3E]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D3A075] mb-1">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Emergency Crisis Helplines</span>
            </div>
            <p className="text-[11px] text-[#A9BDA9] mb-2 leading-relaxed">
              Theraloom is a practice scheduling tool and not an emergency service. In crisis, please call:
            </p>
            <div className="text-[11px] font-mono text-[#FAF8F5] space-y-0.5">
              <div>• Tele-MANAS: <a href="tel:14416" className="font-bold text-white underline hover:text-emerald-300">14416</a> (Govt. of India)</div>
              <div>• Vandrevala: <a href="tel:+919999666555" className="font-bold text-white underline hover:text-emerald-300">+91 9999 666 555</a></div>
              <div>• KIRAN: <a href="tel:18005990019" className="font-bold text-white underline hover:text-emerald-300">1800-599-0019</a></div>
            </div>
            <Link to="/crisis" className="inline-block text-[11px] text-[#A9BDA9] hover:text-white underline mt-2.5">
              View all 24x7 India helplines & protocols →
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7D9D8B] gap-4">
          <p>© {new Date().getFullYear()} Theraloom (theraloom.in). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Practice</Link>
            <Link to="/security" className="hover:text-white transition-colors">Security & Compliance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
