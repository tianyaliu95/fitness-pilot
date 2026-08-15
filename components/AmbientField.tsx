'use client';

/** Soft blurry depth field - adapted from personal-website AmbientField. */
export function AmbientField() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />
      <div className="ambient-grid" />
      <div className="ambient-noise" />
    </div>
  );
}
