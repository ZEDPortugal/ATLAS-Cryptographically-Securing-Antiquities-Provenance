import { NextResponse } from 'next/server';
import { createAccessCode } from '../../../../lib/accessCodes';

export async function POST(req) {
  try {
    // TODO: Add authentication check to ensure only staff can generate codes
    // For now, accepting requests (you can add auth middleware later)
    
    const body = await req.json().catch(() => ({}));
    const { expirationHours = 48, createdBy = 'staff' } = body;
    
    // Validate expiration hours
    if (expirationHours < 1 || expirationHours > 168) { // Max 1 week
      return NextResponse.json(
        { error: 'Expiration hours must be between 1 and 168' },
        { status: 400 }
      );
    }
    
    const code = await createAccessCode(expirationHours, createdBy);
    
    return NextResponse.json({
      success: true,
      code: code.code,
      expiresAt: code.expiresAt,
      expirationHours,
    });
  } catch (error) {
    console.error('Error generating access code:', error);
    return NextResponse.json(
      { error: 'Failed to generate access code', detail: String(error) },
      { status: 500 }
    );
  }
}
