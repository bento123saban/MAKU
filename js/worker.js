/**
 * DLHP Ambon Secure Gateway - Strict Edition
 * Only allows POST from http://localhost:5173
 */

class SecurityGate {
  constructor(env, request) {
    this.env = env;
    this.request = request;
    this.origin = request.headers.get("Origin");
  }

  // 1. Validasi Domain & Method
  isValidRequest() {
    const isPost = this.request.method === "POST";
    const isAllowedOrigin = this.origin === "http://localhost:5173";
    return isPost && isAllowedOrigin;
  }

  // 2. Helper Headers CORS yang Terkunci
  static corsHeaders(origin) {
    return {
      "Access-Control-Allow-Origin": "http://localhost:5173", // Tidak pakai '*' lagi
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Secret, Idempotency-Key",
      "Vary": "Origin" // Memberitahu browser bahwa response tergantung pada Origin
    };
  }
}

class WebAuthnValidator {
  constructor() {
    this._base64ToBuffer = (base64) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  }

  async verify(signatureData, publicKeyB64) {
    try {
      const pubKey = await crypto.subtle.importKey(
        "spki", 
        this._base64ToBuffer(publicKeyB64),
        { name: "ECDSA", namedCurve: "P-256" }, 
        false, 
        ["verify"]
      );

      const signature = this._base64ToBuffer(signatureData.signature);
      const authData = this._base64ToBuffer(signatureData.authenticatorData);
      const clientData = this._base64ToBuffer(signatureData.clientData);

      // Wajib User Verification (Bit ke-2)
      if (!(authData[32] & 0x04)) return { valid: false, reason: "PIN/Biometric Required" };

      const clientDataHash = await crypto.subtle.digest("SHA-256", clientData);
      const signedData = new Uint8Array(authData.length + clientDataHash.byteLength);
      signedData.set(authData);
      signedData.set(new Uint8Array(clientDataHash), authData.length);

      const isValid = await crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        pubKey, signature, signedData
      );

      return { valid: isValid };
    } catch (e) {
      return { valid: false, reason: e.message };
    }
  }
}

export default {
  async fetch(request, env) {
    const gate = new SecurityGate(env, request);
    const url = new URL(request.url);
    const targetGAS = "https://script.google.com/macros/s/AKfycbx91ozr7-_vqlqOVhIeCO61xPkc3-KXk-FJs7OlRgFhUTy7f70z8waxk6jYTp1G_tM/exec";

    // 1. Handle OPTIONS (Preflight) - Wajib agar browser mengizinkan POST
    if (request.method === "OPTIONS") {
      return new Response(null, { 
        status: 204, 
        headers: SecurityGate.corsHeaders(gate.origin) 
      });
    }

    // 2. Blokir jika bukan POST atau bukan dari localhost:5173
    if (!gate.isValidRequest()) {
      return new Response(JSON.stringify({ error: "Forbidden: Strict Origin & Method Policy" }), { 
        status: 403, 
        headers: SecurityGate.corsHeaders(gate.origin)
      });
    }

    try {
      const body = await request.json();

      // 3. ROUTE: Sync KV dari GAS Admin
      if (url.pathname === "/admin/sync") {
        if (request.headers.get("X-Admin-Secret") !== env.ADMIN_SECRET) {
          return new Response("Unauthorized", { status: 401 });
        }
        await env.USER_DEVICES.put(body.email, JSON.stringify(body.devices));
        return new Response("OK", { headers: SecurityGate.corsHeaders(gate.origin) });
      }

      // 4. ROUTE: Verification Logic (WebAuthn)
      if (body.signatureData) {
        const validator = new WebAuthnValidator();
        const userKeys = await env.USER_DEVICES.get(body.email, { type: "json" });
        const device = userKeys?.find(d => d.credId === body.signatureData.id);

        if (!device) return new Response("Device Not Registered", { status: 403 });

        const auth = await validator.verify(body.signatureData, device.publicKey);
        if (!auth.valid) return new Response(auth.reason || "Invalid Signature", { status: 401 });

        delete body.signatureData; // Bersihkan data biner sebelum ke GAS
      }

      // 5. Relay ke GAS
      const forwarded = await fetch(targetGAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const resText = await forwarded.text();
      return new Response(resText, {
        status: forwarded.status,
        headers: { 
          ...SecurityGate.corsHeaders(gate.origin),
          "Content-Type": "application/json" 
        },
      });

    } catch (err) {
      return new Response(err.message, { status: 500 });
    }
  }
};