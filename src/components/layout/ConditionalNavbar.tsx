'use client';

import Navbar from './Navbar';

/**
 * Always renders the static Navbar.
 * The builder no longer provides its own nav — the static one is always shown.
 */
export default function ConditionalNavbar() {
  return <Navbar />;
}
