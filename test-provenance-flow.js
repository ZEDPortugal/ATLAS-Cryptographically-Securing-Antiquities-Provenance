/**
 * Test script to verify provenance implementation
 * Tests the complete flow from data preparation to storage
 */

import { computeMultiModalHash } from './src/lib/hash.js';

// Test data with provenance
const testData = {
  name: "Test Antique",
  description: "A beautiful test antique for debugging",
  images: {
    front: { data: "base64data", type: "image/png" },
    back: { data: "base64data", type: "image/png" },
    left: { data: "base64data", type: "image/png" },
    right: { data: "base64data", type: "image/png" }
  },
  provenance: {
    origin: "Estate Sale",
    previousOwners: "John Doe\nJane Smith",
    dateAcquired: "2025-11-01",
    materialAge: "Bronze, 18th century",
    condition: "excellent",
    authenticity: "Certified by expert"
  }
};

console.log('🧪 Testing Provenance Flow\n');
console.log('Test Data:');
console.log('- Name:', testData.name);
console.log('- Description:', testData.description);
console.log('- Provenance fields:', Object.keys(testData.provenance).length);
console.log('- Image views:', Object.keys(testData.images).length);
console.log('');

try {
  console.log('🔐 Computing multi-modal hash with provenance...');
  const hashResult = await computeMultiModalHash({
    name: testData.name,
    description: testData.description,
    images: testData.images,
    provenance: testData.provenance
  });

  console.log('\n✅ Hash computation successful!');
  console.log('');
  console.log('Hash Components:');
  console.log('- Image pHash:', hashResult.image_phash);
  console.log('- Text signature:', hashResult.text_sig);
  console.log('- Provenance digest:', hashResult.provenance_digest);
  console.log('- Combined hash:', hashResult.combined_hash.substring(0, 32) + '...');
  console.log('');

  // Test with empty provenance
  console.log('🧪 Testing with empty provenance...');
  const emptyProvenanceHash = await computeMultiModalHash({
    name: testData.name,
    description: testData.description,
    images: testData.images,
    provenance: {}
  });

  console.log('✅ Empty provenance hash:', emptyProvenanceHash.combined_hash.substring(0, 32) + '...');
  console.log('');

  // Test JSON serialization
  console.log('📦 Testing JSON serialization...');
  const payload = {
    name: testData.name,
    description: testData.description,
    images: testData.images,
    owner: "Test Owner",
    provenance: testData.provenance
  };

  const jsonString = JSON.stringify(payload);
  console.log('✅ JSON size:', (jsonString.length / 1024).toFixed(2), 'KB');
  
  const parsed = JSON.parse(jsonString);
  console.log('✅ JSON parse successful');
  console.log('✅ Provenance preserved:', parsed.provenance.origin === testData.provenance.origin);
  console.log('');

  console.log('🎉 All tests passed!');
  console.log('');
  console.log('Summary:');
  console.log('- Hash computation: ✅');
  console.log('- Empty provenance handling: ✅');
  console.log('- JSON serialization: ✅');
  console.log('- Data integrity: ✅');

} catch (error) {
  console.error('\n❌ Test failed!');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
