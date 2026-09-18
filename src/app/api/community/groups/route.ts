import { NextResponse } from 'next/server';

export async function GET() {
  const groups = [
    { id: '1', name: 'Forex Desk', members: '1,248', category: 'Currencies', icon: 'currency_exchange' },
    { id: '2', name: 'Prop Passers', members: '892', category: 'Challenges', icon: 'sports_score' },
    { id: '3', name: 'Crypto Signals', members: '3,410', category: 'Digital Assets', icon: 'currency_bitcoin' },
    { id: '4', name: 'Options Trading', members: '512', category: 'Derivatives', icon: 'monitoring' },
    { id: '5', name: 'Gold & Indices', members: '2,105', category: 'Commodities', icon: 'diamond' },
    { id: '6', name: 'Mindset & Psychology', members: '4,550', category: 'Education', icon: 'psychology' },
  ];

  return NextResponse.json({ groups });
}
