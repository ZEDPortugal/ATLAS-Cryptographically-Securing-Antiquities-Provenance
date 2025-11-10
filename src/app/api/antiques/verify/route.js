import { NextResponse } from 'next/server'
import { findByHash, getAntique, initializeDatabase } from '../../../../lib/db'

export async function POST(req) {
  console.log('🔍 Verification request received');
  
  const body = await req.json().catch((err) => {
    console.error('❌ Failed to parse JSON:', err);
    return null;
  });
  
  if (!body) {
    console.error('❌ Invalid JSON body');
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  let { hash } = body;
  if (!hash) {
    console.error('❌ Missing hash');
    return NextResponse.json({ error: 'missing hash' }, { status: 400 });
  }

  // Trim whitespace and normalize
  hash = hash.trim().toLowerCase();

  try {
    console.log('🔍 Verifying hash:', hash.substring(0, 16) + '...');
    console.log('📏 Hash length:', hash.length);
    
    console.log('🔄 Ensuring database is initialized...');
    await initializeDatabase();
    
    console.log('🔎 Searching blockchain for hash...');
    const found = await findByHash(hash);
    console.log('Blockchain entry found:', found ? 'YES' : 'NO');
    
    if (found) {
      console.log('✅ Found blockchain entry, fetching antique details...');
      const antique = await getAntique(hash);
      console.log('Antique found:', antique ? 'YES' : 'NO');
      
      return NextResponse.json({ status: 'found', block: found, antique });
    }
    
    console.log('❌ No blockchain entry found for hash:', hash.substring(0, 16) + '...');
    return NextResponse.json({ status: 'not_found' });
  } catch (e) {
    console.error('❌ Verification error:', e);
    console.error('Error message:', e.message);
    console.error('Error stack:', e.stack);
    
    return NextResponse.json({ 
      error: 'internal', 
      detail: String(e), 
      stack: process.env.NODE_ENV === 'development' ? e.stack : undefined 
    }, { status: 500 });
  }
}
