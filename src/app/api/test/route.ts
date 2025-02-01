import { NextResponse } from 'next/server';

export async function GET() {
  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ];
  
return NextResponse.json(items, { status: 200 });
}
