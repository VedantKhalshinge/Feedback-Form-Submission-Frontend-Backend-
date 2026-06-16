/* 
  =============================================================================
  © 2026 Vedant Khalshinge. All Rights Reserved.
  ============================================================================= 
*/
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3050/feedback';

async function runAll() {
  console.log("==================================================");
  console.log(" FEEDBACK FORM — MONGODB & MULTER FULL TEST ");
  console.log("==================================================");
  
  let pass = 0, fail = 0;
  
  // Clear DB
  try {
    await fetch(API_URL, { method: 'DELETE' });
  } catch(e) {
    console.log("Server not running or DB unavailable.", e.message);
    return;
  }

  // TEST 1: Empty Form (Validation)
  const fd1 = new FormData();
  const r1 = await fetch(API_URL, { method: 'POST', body: fd1 });
  const d1 = await r1.json();
  process.stdout.write("--- TEST 1: Empty form validation --- ");
  if (r1.status === 400 && d1.errors.join().includes('is required')) { console.log("[PASS] 400"); pass++; } else { console.log("[FAIL]", d1); fail++; }

  // TEST 2: Successful submission without file
  const fd2 = new FormData();
  fd2.append('name', 'Jane Student');
  fd2.append('email', 'jane@test.com');
  fd2.append('message', 'Great class!');
  const r2 = await fetch(API_URL, { method: 'POST', body: fd2 });
  const d2 = await r2.json();
  process.stdout.write("--- TEST 2: Successful submission (No File) --- ");
  if (r2.status === 201 && d2.success) { console.log("[PASS] 201 Created"); pass++; } else { console.log("[FAIL]", d2); fail++; }

  // TEST 3: Successful submission WITH file
  const fd3 = new FormData();
  fd3.append('name', 'John Multer');
  fd3.append('email', 'john@test.com');
  fd3.append('message', 'Here is my file.');
  // Create a dummy file for testing
  const dummyFilePath = path.join(__dirname, 'test-dummy.png');
  fs.writeFileSync(dummyFilePath, 'dummy image data');
  const fileBlob = new Blob([fs.readFileSync(dummyFilePath)], { type: 'image/png' });
  fd3.append('attachment', fileBlob, 'test-dummy.png');

  const r3 = await fetch(API_URL, { method: 'POST', body: fd3 });
  const d3 = await r3.json();
  process.stdout.write("--- TEST 3: Successful submission (With File) --- ");
  if (r3.status === 201 && d3.success) { console.log("[PASS] 201 Created"); pass++; } else { console.log("[FAIL]", d3); fail++; }

  // Cleanup dummy file
  if(fs.existsSync(dummyFilePath)) fs.unlinkSync(dummyFilePath);

  // TEST 4: Invalid email format
  const fd4 = new FormData();
  fd4.append('name', 'Bob');
  fd4.append('email', 'bob-no-domain');
  fd4.append('message', 'Hey');
  const r4 = await fetch(API_URL, { method: 'POST', body: fd4 });
  const d4 = await r4.json();
  process.stdout.write("--- TEST 4: Invalid email format --- ");
  if (r4.status === 400 && d4.errors.join().includes('valid format')) { console.log("[PASS] 400"); pass++; } else { console.log("[FAIL]", d4); fail++; }

  console.log("\n==================================================");
  console.log(` RESULTS: ${pass} PASSED / 4 TOTAL`);
  if (fail === 0) console.log(" ALL TESTS PASSED!");
  else console.log(` ${fail} FAILED`);
  console.log("==================================================");
}

runAll();
