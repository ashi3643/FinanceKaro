import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'FinanceKaro API',
    status: 'operational',
    endpoints: {
      predict: '/api/predict - Make a wealth prediction'
    }
  });
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
