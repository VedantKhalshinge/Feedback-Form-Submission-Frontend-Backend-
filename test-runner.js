const http = require('http');

async function testEndpoint(name, path, method, contentType, bodyText) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: method,
        headers: {
          'Content-Type': contentType,
          'Content-Length': Buffer.byteLength(bodyText)
        }
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, data });
        });
      }
    );
    req.on('error', e => resolve({ status: 500, error: e.message }));
    req.write(bodyText);
    req.end();
  });
}

async function runAll() {
  console.log("==========================================");
  console.log(" FEEDBACK FORM — FULL REQUIREMENTS TEST ");
  console.log("==========================================");
  
  let pass = 0, fail = 0;

  // TEST 1
  process.stdout.write("--- TEST 1: POST /feedback endpoint exists --- ");
  let r1 = await testEndpoint('T1', '/feedback', 'POST', 'application/json', '{}');
  if (r1.status === 400) { console.log("[PASS] 400 for empty body"); pass++; } else { console.log(`[FAIL] Status: ${r1.status}`); fail++; }

  // TEST 2
  process.stdout.write("--- TEST 2: req.body via urlencoded --- ");
  let r2 = await testEndpoint('T2', '/feedback', 'POST', 'application/x-www-form-urlencoded', 'name=TestUser&email=test@example.com&message=This+is+a+test+message+from+urlencoded');
  if (r2.data.includes('TestUser')) { console.log("[PASS] Captured correctly"); pass++; } else { console.log("[FAIL] " + r2.data); fail++; }

  // TEST 3
  process.stdout.write("--- TEST 3: req.body via JSON --- ");
  let r3 = await testEndpoint('T3', '/feedback', 'POST', 'application/json', '{"name":"JSONUser","email":"json@test.com","message":"Testing JSON body parsing works great"}');
  if (r3.data.includes('JSONUser')) { console.log("[PASS] Captured correctly"); pass++; } else { console.log("[FAIL] " + r3.data); fail++; }

  // TEST 4
  process.stdout.write("--- TEST 4: Storage works --- ");
  let r4 = await testEndpoint('T4', '/feedback', 'GET', 'application/json', '');
  let data4 = JSON.parse(r4.data);
  if (data4.total >= 2) { console.log("[PASS] Submissions stored"); pass++; } else { console.log("[FAIL]"); fail++; }

  // TEST 5
  process.stdout.write("--- TEST 5: Auto-timestamp --- ");
  if (data4.submissions[0].timestamp) { console.log("[PASS] Timestamp present"); pass++; } else { console.log("[FAIL]"); fail++; }

  // TEST 6a
  process.stdout.write("--- TEST 6a: Validation - Empty name --- ");
  let r6a = await testEndpoint('T6a', '/feedback', 'POST', 'application/json', '{"name":"","email":"a@b.com","message":"Valid message here"}');
  if (r6a.status === 400) { console.log("[PASS] 400"); pass++; } else { console.log("[FAIL]"); fail++; }

  // TEST 6b
  process.stdout.write("--- TEST 6b: Validation - Empty email --- ");
  let r6b = await testEndpoint('T6b', '/feedback', 'POST', 'application/json', '{"name":"Jane","email":"","message":"Valid message here"}');
  if (r6b.status === 400) { console.log("[PASS] 400"); pass++; } else { console.log("[FAIL]"); fail++; }

  // TEST 6c
  process.stdout.write("--- TEST 6c: Validation - Empty message --- ");
  let r6c = await testEndpoint('T6c', '/feedback', 'POST', 'application/json', '{"name":"Jane","email":"a@b.com","message":""}');
  if (r6c.status === 400) { console.log("[PASS] 400"); pass++; } else { console.log("[FAIL]"); fail++; }

  // TEST 7
  process.stdout.write("--- TEST 7: Invalid email format --- ");
  let r7 = await testEndpoint('T7', '/feedback', 'POST', 'application/json', '{"name":"Jane","email":"notanemail","message":"Valid message here"}');
  if (r7.status === 400) { console.log("[PASS] 400"); pass++; } else { console.log("[FAIL]"); fail++; }

  // TEST 8
  process.stdout.write("--- TEST 8: Success response 201 --- ");
  let r8 = await testEndpoint('T8', '/feedback', 'POST', 'application/json', '{"name":"Success Test","email":"ok@test.com","message":"This should return 201 Created"}');
  if (r8.status === 201) { console.log("[PASS] 201 Created"); pass++; } else { console.log("[FAIL]"); fail++; }

  // TEST 9
  process.stdout.write("--- TEST 9: Error response details --- ");
  let r9 = await testEndpoint('T9', '/feedback', 'POST', 'application/json', '{"name":"A","email":"bad","message":"short"}');
  let data9 = JSON.parse(r9.data);
  if (r9.status === 400 && data9.errors.length > 0) { console.log("[PASS] Errors array present"); pass++; } else { console.log("[FAIL]"); fail++; }

  // TEST 10
  process.stdout.write("--- TEST 10: XSS Sanitization --- ");
  let r10 = await testEndpoint('T10', '/feedback', 'POST', 'application/json', '{"name":"<script>alert(1)</script>","email":"xss@test.com","message":"XSS test"}');
  if (!r10.data.includes('<script>')) { console.log("[PASS] Sanitized"); pass++; } else { console.log("[FAIL]"); fail++; }

  console.log("\n==========================================");
  console.log(` RESULTS: ${pass} PASSED / ${pass + fail} TOTAL`);
  if (fail === 0) console.log(" ALL TESTS PASSED!");
  else console.log(` ${fail} FAILED`);
  console.log("==========================================");
}
runAll();
