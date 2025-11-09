import { NextResponse } from 'next/server';
import { getAllAccessCodes, cleanupExpiredCodes } from '../../../../lib/accessCodes';

export async function GET(req) {
  try {
    // TODO: Add authentication check to ensure only staff can list codes
    
    const codes = await getAllAccessCodes();
    
    return NextResponse.json({
      success: true,
      codes,
    });
  } catch (error) {
    console.error('Error listing access codes:', error);
    return NextResponse.json(
      { error: 'Failed to list access codes', detail: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    // Cleanup expired codes
    const removed = await cleanupExpiredCodes();
    
    return NextResponse.json({
      success: true,
      removed,
    });
  } catch (error) {
    console.error('Error cleaning up codes:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup codes', detail: String(error) },
      { status: 500 }
    );
  }
}
