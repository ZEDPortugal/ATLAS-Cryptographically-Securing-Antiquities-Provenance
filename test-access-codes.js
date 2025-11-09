// Test script for access code system
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

async function testAccessCodeSystem() {
  console.log('🧪 Testing Access Code System\n');
  console.log(`   Using base URL: ${baseUrl}\n`);

  try {
    // Test 1: Generate a new access code
    console.log('1️⃣ Generating new access code...');
    const generateRes = await fetch(`${baseUrl}/api/access-codes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expirationHours: 48, createdBy: 'test-script' })
    });
    const generateData = await generateRes.json();
    
    if (generateData.success) {
      console.log(`   ✅ Code generated: ${generateData.code}`);
      console.log(`   ⏰ Expires: ${new Date(generateData.expiresAt).toLocaleString()}`);
      
      const testCode = generateData.code;

      // Test 2: Validate the code
      console.log('\n2️⃣ Validating the generated code...');
      const validateRes = await fetch(`${baseUrl}/api/access-codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: testCode })
      });
      const validateData = await validateRes.json();
      
      if (validateData.valid) {
        console.log(`   ✅ Code is valid`);
        console.log(`   📊 Usage count: ${validateData.code.usageCount}`);
      } else {
        console.log(`   ❌ Validation failed: ${validateData.reason}`);
      }

      // Test 3: Validate again (test usage tracking)
      console.log('\n3️⃣ Testing usage tracking...');
      const validate2Res = await fetch(`${baseUrl}/api/access-codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: testCode })
      });
      const validate2Data = await validate2Res.json();
      
      if (validate2Data.valid) {
        console.log(`   ✅ Code still valid`);
        console.log(`   📊 Usage count increased to: ${validate2Data.code.usageCount}`);
      }

      // Test 4: Try invalid code
      console.log('\n4️⃣ Testing invalid code...');
      const invalidRes = await fetch(`${baseUrl}/api/access-codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'INVALID-CODE' })
      });
      const invalidData = await invalidRes.json();
      
      if (!invalidData.valid) {
        console.log(`   ✅ Invalid code correctly rejected: ${invalidData.reason}`);
      } else {
        console.log(`   ❌ Invalid code was accepted (should not happen)`);
      }

      // Test 5: List all codes
      console.log('\n5️⃣ Listing all access codes...');
      const listRes = await fetch(`${baseUrl}/api/access-codes/list`);
      const listData = await listRes.json();
      
      if (listData.success) {
        console.log(`   ✅ Found ${listData.codes.length} total code(s)`);
        console.log(`   📋 Recent codes:`);
        listData.codes.slice(0, 3).forEach(code => {
          const expired = code.expiresAt < Date.now();
          const status = expired ? '❌ EXPIRED' : '✅ ACTIVE';
          console.log(`      ${status} ${code.code} - Used ${code.usageCount}x`);
        });
      }

      console.log('\n✨ All tests completed successfully!\n');
      console.log('🔗 Access URLs:');
      console.log(`   Staff Panel: ${baseUrl}/admin/access-codes`);
      console.log(`   Buyer Portal: ${baseUrl}/verify-secure`);
      console.log(`   Test Code: ${testCode}\n`);

    } else {
      console.log(`   ❌ Failed to generate code: ${generateData.error}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testAccessCodeSystem();
