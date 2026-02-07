// Quick test script for password reset flow (ESM)
// Prereqs: backend must be running at http://localhost:8080
// This script calls /api/password-recovery/request and prints the response
// If a redirectUrl is returned and contains a hash with access_token, it will print the token as well.

import axios from 'axios';

(async () => {
  const backendBaseUrl = process.argv[2] || 'http://localhost:8080';
  const email = process.argv[3] || 'test@example.com';
  try {
    const resp = await axios.post(`${backendBaseUrl}/api/password-recovery/request`, { email }, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = resp.data || {};
    console.log('[Test] Response from /password-recovery/request:');
    console.log(JSON.stringify(data, null, 2));

    const redirectUrl = data?.redirectUrl || null;
    if (redirectUrl) {
      console.log('[Test] Redirect URL:', redirectUrl);
      const hashIndex = redirectUrl.indexOf('#');
      const hash = hashIndex >= 0 ? redirectUrl.substring(hashIndex + 1) : '';
      if (hash) {
        const tokenParam = hash.split('&').find(p => p.startsWith('access_token='));
        const token = tokenParam ? tokenParam.split('=')[1] : null;
        if (token) {
          console.log('[Test] Detected token en hash:', token);
        } else {
          console.log('[Test] No token en hash de redirect. Hash:', hash);
        }
      } else {
        console.log('[Test] No hash en URL de redirect. URL completa:', redirectUrl);
      }
    } else {
      console.log('[Test] No se devolvió redirectUrl en la respuesta.');
    }
  } catch (err) {
    console.error('[Test] Error al ejecutar la prueba:', err?.message || err);
  }
})();
