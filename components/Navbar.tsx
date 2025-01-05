'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";

const navItems = [
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [hidden] = useState(false);
  // const { scrollY } = useScroll();
  const { theme, setTheme } = useTheme();

  return (
    <motion.header
      className="fixed top-0 w-full bg-background/80 backdrop-blur-sm z-50 border-b border-border"
      animate={hidden ? { y: '-100%' } : { y: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      <nav className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">
        <Link href="/" className="text-2xl font-bold">YourName</Link>
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className="hover:text-primary transition">
              {item.name}
            </Link>
          ))}
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
        </div>
      </nav>
    </motion.header>
  );
}
