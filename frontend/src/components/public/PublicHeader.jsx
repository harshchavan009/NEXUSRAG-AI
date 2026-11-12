import React, { useState } from 'react';
import { VIEWS } from '../layout/RailNav';
import { Button } from '../common/Button';
import { ChevronDown, Menu, X, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export function PublicHeader({ currentView, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Overview', view: VIEWS.LANDING },
    { label: 'Documentation', view: VIEWS.DOCS },
    { label: 'Security & Privacy', view: VIEWS.SECURITY },
    { label: 'FAQ', view: VIEWS.FAQ },
    { label: 'System Status', view: VIEWS.STATUS },
    { label: 'About', view: VIEWS.ABOUT },
    { label: 'Contact', view: VIEWS.ABOUT, hash: '#contact' },
  ];

  const handleNavClick = (link) => {
    onNavigate(link.view);
    setMobileMenuOpen(false);
    if (link.hash && typeof window !== 'undefined') {
      setTimeout(() => {
        const el = document.querySelector(link.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="border-b border-border/40 bg-surface/90 backdrop-blur-xs sticky top-0 z-40 select-none">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onNavigate(VIEWS.LANDING)}
            className="flex items-center gap-2 font-bold text-base tracking-tight text-ink text-left focus:outline-none"
          >
            <div className="w-7 h-7 rounded bg-[#B84A28] flex items-center justify-center text-white shadow-xs">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 32 32">
                <path d="M8 10h6a4 4 0 0 1 4 4v10a4 4 0 0 0-4-4H8V10zm16 0h-6a4 4 0 0 0-4 4v10a4 4 0 0 1 4-4h6V10z" fill="currentColor"/>
                <circle cx="16" cy="14" r="2" fill="#F7F6F2"/>
              </svg>
            </div>
            <span>
              nexus<span className="text-[#B84A28]">rag</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs text-ink-muted font-medium">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className={clsx(
                  'transition-colors hover:text-ink',
                  currentView === link.view && 'text-brand font-semibold'
                )}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={ArrowRight}
            onClick={() => onNavigate(VIEWS.DASHBOARD)}
          >
            Open Workspace
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-1.5 text-ink-muted hover:text-ink"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-surface px-6 py-4 flex flex-col gap-3 text-xs">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link)}
              className={clsx(
                'text-left py-2 font-medium',
                currentView === link.view ? 'text-brand' : 'text-ink-muted hover:text-ink'
              )}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-border">
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center"
              onClick={() => {
                onNavigate(VIEWS.DASHBOARD);
                setMobileMenuOpen(false);
              }}
            >
              Open Workspace
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

