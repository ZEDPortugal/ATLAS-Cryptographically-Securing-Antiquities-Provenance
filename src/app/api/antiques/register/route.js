import { NextResponse } from 'next/server'
import Antique from '../../../../lib/antique'
import { computeMultiModalHash } from '../../../../lib/hash'
import { appendBlock, saveAntique, initializeDatabase } from '../../../../lib/db'

export async function POST(req) {
  console.log('📝 Antique registration request received');
  
  const body = await req.json().catch((err) => {
    console.error('❌ Failed to parse JSON:', err);
    return null;
  });
  
  if (!body) {
    console.error('❌ Invalid JSON body');
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const { name, description, images, owner, provenance } = body;
  console.log('📦 Request data:', { 
    name, 
    owner, 
    hasImages: !!images, 
    imageKeys: images ? Object.keys(images) : [],
    hasProvenance: !!provenance,
    provenanceKeys: provenance ? Object.keys(provenance) : []
  });
  
  if (!name) {
    console.error('❌ Missing name');
    return NextResponse.json({ error: 'missing name' }, { status: 400 });
  }

  if (!images || typeof images !== 'object') {
    console.error('❌ Invalid or missing images object');
    return NextResponse.json({ error: 'invalid images format' }, { status: 400 });
  }

  try {
    const art = new Antique({ name, description, images });
    const missingViews = Object.entries(art.images)
      .filter(([, value]) => !value.data)
      .map(([key]) => key);
      
    if (missingViews.length) {
      console.error('❌ Missing image views:', missingViews);
      return NextResponse.json({ error: `Missing image(s): ${missingViews.join(', ')}` }, { status: 400 });
    }
  } catch (antiqueError) {
    console.error('❌ Failed to create Antique object:', antiqueError);
    return NextResponse.json({ 
      error: 'invalid antique data', 
      detail: antiqueError.message 
    }, { status: 400 });
  }

  const art = new Antique({ name, description, images });
  
  console.log('🔐 Computing multi-modal hash...');
  
  try {
    // Compute multi-modal hash components and composite
    const mm = await computeMultiModalHash({ 
      name: art.name, 
      description: art.description, 
      images: art.images 
    });
    
    const hash = mm.combined_hash.toLowerCase().trim(); // Normalize hash
    console.log('✅ Hash computed:', hash.substring(0, 16) + '...');

    console.log('🔄 Initializing database...');
    await initializeDatabase();
    
    console.log('💾 Saving antique to database...');
    // Save antique FIRST (before blockchain entry due to foreign key constraint)
    const savedAntique = await saveAntique(hash, {
      name: art.name,
      description: art.description,
      images: art.images,
      createdAt: Date.now(),
      combinedHash: mm.combined_hash,
      imagePhash: mm.image_phash,
      textSig: mm.text_sig,
      provenanceDigest: mm.provenance_digest,
      provenance: provenance || null, // Save provenance data
    });
    
    console.log('✅ Antique saved to database');
    
    // Then append to blockchain (references antique)
    // Use provided owner or fallback to antique name
    const blockOwner = owner || name;
    console.log('📦 Adding blockchain entry for owner:', blockOwner);
    
    const block = await appendBlock({ antiqueHash: savedAntique.hash, owner: blockOwner });
    console.log('✅ Blockchain entry created, block index:', block.index);
    
    return NextResponse.json({ status: 'ok', hash: savedAntique.hash, block });
  } catch (e) {
    console.error('❌ Antique registration error:', e);
    console.error('Error message:', e.message);
    console.error('Error stack:', e.stack);
    
    return NextResponse.json({ 
      error: 'storage error', 
      detail: e.message || String(e),
      stack: process.env.NODE_ENV === 'development' ? e.stack : undefined
    }, { status: 500 });
  }
}
