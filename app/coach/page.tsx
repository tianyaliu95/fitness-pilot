import { redirect } from 'next/navigation';

/** Legacy route - coach is a floating widget now. */
export default function CoachPage() {
  redirect('/');
}
