import { NextResponse } from 'next/server';
import { validateAccessCode, deleteAccessCode } from '../../../../lib/accessCodes';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    
    if (!body || !body.code) {
      return NextResponse.json(
        { valid: false, reason: 'No code provided' },
        { status: 400 }
      );
    }
    
    const result = await validateAccessCode(body.code);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating access code:', error);
    return NextResponse.json(
      { valid: false, reason: 'Validation error', detail: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json().catch(() => null);
    
    if (!body || !body.code) {
      return NextResponse.json(
        { success: false, error: 'No code provided' },
        { status: 400 }
      );
    }
    
    await deleteAccessCode(body.code);
    
    return NextResponse.json({ success: true, message: 'Code deleted successfully' });
  } catch (error) {
    console.error('Error deleting access code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete code', detail: String(error) },
      { status: 500 }
    );
  }
}
