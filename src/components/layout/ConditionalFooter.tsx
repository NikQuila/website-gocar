'use client';

import { Footer } from './Footer';

/**
 * Always renders the static Footer.
 * The builder no longer provides its own footer — the static one is always shown.
 */
export default function ConditionalFooter() {
  return <Footer />;
}
