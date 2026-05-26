'use client';

import Link from 'next/link';

export default function ModuleGate({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-900">
      <h2 className="font-semibold text-sm">{title} is disabled in this demo package</h2>
      <p className="text-sm mt-1">{description}</p>
      <Link href="/feature-builder" className="inline-block text-sm font-semibold mt-3 underline">
        Enable this module in Feature Builder
      </Link>
    </div>
  );
}
