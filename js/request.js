import { isReallyOnline } from "./UI";





/**
 * RequestManager - Ultra-Robust Fetch Handler for MAKU Project
 * Optimasi: Fix bug penanganan failRes, penyesuaian abort signal, dan integrasi GAS/Workers.
 */
class RequestManager {

    constructor() {
        if (RequestManager.instance) return RequestManager.instance;
        this.maxRetries         = 3;
        this.retryDelay         = 1000;      // ms
        this.timeoutMs          = 60000;    // ms
        this.deferWhenHidden    = false;
        this.maxHiddenDeferMs   = 4000;
        this.appCTRL            = {
            baseURL : "https://maku.dlhpambon2025.workers.dev/"
        };
        this.baseURL            = (typeof STATIC !== "undefined" && STATIC.URL) ? STATIC.URL : "https://maku.dlhpambon2025.workers.dec. UIv/";
        var self = this;
        if (!Object.getOwnPropertyDescriptor(this, "URL")) {
            Object.defineProperty(this, "URL", {
                enumerable   : true,
                configurable : false,
                get          : function () {
                    var raw = (self.appCTRL && self.appCTRL.baseURL) ? self.appCTRL.baseURL : self.baseURL;
                    return self._normalizeBaseURL(raw);
                }
            });
        }
        RequestManager.instance = this;
    }

	/**
	 * Super Advance Online Check
	 * Melakukan verifikasi hingga 3 kali dengan sistem 'ping' ke real-world server.
	 */
	

    async post(pathOrData, dataArg, optionsArg) {
        let path = typeof pathOrData === "string" ? pathOrData : "";
        let data = typeof pathOrData === "object" ? pathOrData : dataArg || {};
        let options = optionsArg || (typeof pathOrData === "object" ? dataArg : {}) || {};

        const base = this._requireBaseURL();
        const url = this._joinURL(base, path);
        
        // Pre-check Online Status
        const online = await isReallyOnline();
		if (!online) {
			const offlineRes = this._makeResult(false, "OFFLINE", null, { 
				code: "OFFLINE", 
				message: "Internet tidak stabil atau terputus." 
			}, url);
			
			// this._safeToast("error", "Koneksi bermasalah!");
			return offlineRes;
		}

        // Visibility Deferring
        // if (this.deferWhenHidden && typeof document !== "undefined" && document.hidden) {
        //     this._log("⏸️ Menunda POST karena tab hidden");
        //     await this._waitUntilVisible(this.maxHiddenDeferMs);
        // }

        const requestId = this._makeUUID();

        const headers = Object.assign({
            "Accept": "application/json, text/plain;q=0.9, */*;q=0.8",
            "Idempotency-Key": requestId
        }, options.headers || {});

        // Body Handling
        let body = null;
        if (typeof FormData !== "undefined" && data instanceof FormData) {
            body = data;
            // Browser otomatis set Content-Type untuk FormData
        } else {
            headers["Content-Type"] = headers["Content-Type"] || "application/json";
            body = headers["Content-Type"].includes("application/json") ? JSON.stringify(data) : data;
        }

        let attempt = 0;
        let retried = false;
        const startAll = this._nowMs();

        while (attempt < this.maxRetries) {
            attempt++;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort("TIMEOUT"), this.timeoutMs);

            try {
                this._log(`📤 POST attempt ${attempt}/${this.maxRetries}`, { url });
                const res = await fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: body,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                const parsed = await this._smartParseResponse(res);

                if (res.ok) {
                    return this._makeResult(true, "SUCCESS", res.status, null, url, attempt, this._nowMs() - startAll, retried, requestId, parsed.data);
                }

                // Jika HTTP Error tapi tidak perlu retry (misal 401 Unauthorized atau 400 Bad Request)
                if (!this._shouldRetryHTTP(res) || attempt >= this.maxRetries) {
                    const failRes = this._makeResult(false, this._statusFromHttp(res.status), res.status, {
                        code: parsed.errorCode || "ERROR",
                        message: parsed.errorMessage || `Gagal (status ${res.status})`
                    }, url, attempt, this._nowMs() - startAll, retried, requestId, parsed.data);
                    
                    this._safeToast("error", failRes.error.message);
                    return failRes;
                }

                retried = true;
                await this._delay(this._computeBackoff(attempt, this.retryDelay, res));

            } catch (err) {
                clearTimeout(timeoutId);
                const code = this._classifyFetchError(err);

                if (code === "ABORTED" && attempt >= this.maxRetries) {
                    return this._makeResult(false, "ABORTED", null, { code, message: "Request Timeout setelah 3 kali mencoba." }, url, attempt, this._nowMs() - startAll, retried, requestId);
                }

                if (attempt >= this.maxRetries) {
                    const fail = this._makeResult(false, code, null, { code, message: this._readableFetchError(err, code) }, url, attempt, this._nowMs() - startAll, retried, requestId);
                    this._safeToast("error", fail.error.message);
                    return fail;
                }

                retried = true;
                const backoff = this._computeBackoff(attempt, this.retryDelay);
                this._log(`🔄 Retrying in ${backoff}ms due to:`, code);
                await this._delay(backoff);
            }
        }
    }

    async get(pathOrParams, paramsArg, optionsArg) {
        let path = typeof pathOrParams === "string" ? pathOrParams : "";
        let params = typeof pathOrParams === "object" ? pathOrParams : paramsArg || {};
        let options = optionsArg || (typeof pathOrParams === "object" ? paramsArg : {}) || {};

        const base = this._requireBaseURL();
        let url = this._joinURL(base, path);

        // Append Query Parameters ke URL
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += (url.includes("?") ? "&" : "?") + queryString;
        }

        // Pre-check Online Status
        const online = await isReallyOnline();
        if (!online) {
            return this._makeResult(false, "OFFLINE", null, { 
                code: "OFFLINE", 
                message: "Internet tidak stabil atau terputus." 
            }, url);
        }

        const requestId = this._makeUUID();
        const headers = Object.assign({
            "Accept": "application/json, text/plain;q=0.9, */*;q=0.8",
            "X-Request-Id": requestId // GET biasanya tidak pakai Idempotency-Key, tapi bagus untuk tracing
        }, options.headers || {});

        let attempt = 0;
        let retried = false;
        const startAll = this._nowMs();

        while (attempt < this.maxRetries) {
            attempt++;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort("TIMEOUT"), this.timeoutMs);

            try {
                this._log(`📥 GET attempt ${attempt}/${this.maxRetries}`, { url });
                const res = await fetch(url, {
                    method: "GET",
                    headers: headers,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                const parsed = await this._smartParseResponse(res);

                if (res.ok) {
                    return this._makeResult(true, "SUCCESS", res.status, null, url, attempt, this._nowMs() - startAll, retried, requestId, parsed.data);
                }

                // Error handling untuk non-ok status
                if (!this._shouldRetryHTTP(res) || attempt >= this.maxRetries) {
                    const failRes = this._makeResult(false, this._statusFromHttp(res.status), res.status, {
                        code: parsed.errorCode || "ERROR",
                        message: parsed.errorMessage || `Gagal (status ${res.status})`
                    }, url, attempt, this._nowMs() - startAll, retried, requestId, parsed.data);
                    
                    this._safeToast("error", failRes.error.message);
                    return failRes;
                }

                retried = true;
                await this._delay(this._computeBackoff(attempt, this.retryDelay, res));

            } catch (err) {
                clearTimeout(timeoutId);
                const code = await this._classifyFetchError(err);

                if (code === "ABORTED" && attempt >= this.maxRetries) {
                    return this._makeResult(false, "ABORTED", null, { 
                        code, 
                        message: "Request Timeout setelah beberapa kali mencoba." 
                    }, url, attempt, this._nowMs() - startAll, retried, requestId);
                }

                if (attempt >= this.maxRetries) {
                    const fail = this._makeResult(false, code, null, { 
                        code, 
                        message: this._readableFetchError(err, code) 
                    }, url, attempt, this._nowMs() - startAll, retried, requestId);
                    
                    this._safeToast("error", fail.error.message);
                    return fail;
                }

                retried = true;
                const backoff = this._computeBackoff(attempt, this.retryDelay);
                this._log(`🔄 Retrying GET in ${backoff}ms due to:`, code);
                await this._delay(backoff);
            }
        }
    }

    // --- Private Helper yang disempurnakan ---
    async _classifyFetchError(err) {
        if (err.name === 'AbortError' || err === 'TIMEOUT') return "TIMEOUT";
        const isOnline = await isReallyOnline()
        if (isOnline.code == 0) return "OFFLINE"
        if (isOnline.code == 1) return "NETWORK_ERROR"
        return "INVALID_ENDPOINT";
    }

    _computeBackoff(attempt, baseDelay, res) {
        // Mendukung header Retry-After jika ada dari server
        let retryAfterMs = 0;
        const ra = res?.headers?.get("Retry-After");
        if (ra) retryAfterMs = isNaN(ra) ? 5000 : parseInt(ra, 10) * 1000;

        const expo = Math.min(10000, baseDelay * Math.pow(2, attempt - 1));
        const jitter = Math.random() * 500;
        return Math.max(retryAfterMs, expo + jitter);
    }
    
    // ... sisa method utility lainnya tetap sama seperti kode kamu ...

	_log() { 
        try { 
            var args = Array.prototype.slice.call(arguments);
            console.log.apply(console, ["[RequestManager]"].concat(args)); 
        } catch(_) {}
    }

    // ====== PRIVATE UTILS ======
    _normalizeBaseURL(u) {
        if (typeof u !== "string") return "";
        var s = u.trim();
        if (!s) return "";
        if (/^\/\//.test(s)) s = "https:" + s;
        if (!/^https?:\/\//i.test(s)) s = "https://" + s;
        s = s.replace(/\/+$/, "");
        return s;
    }
    _requireBaseURL() {
        var u = this.URL;
        if (!u || u == "INVALID_URL") throw new Error("RequestManager : baseURL belum diset (baseURL kosong) atau URL tidak valid");
        return u;
    }
    _nowMs() {
        try { return (typeof performance !== "undefined" && typeof performance.now === "function") ? performance.now() : Date.now(); }
        catch(_) { return Date.now(); }
    }
    _delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    _makeUUID() {
        try { return (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : (Date.now() + "-" + Math.random().toString(16).slice(2)); }
        catch(_) { return (Date.now() + "-" + Math.random().toString(16).slice(2)); }
    }
    _joinURL(base, p) {
        if (!p) return base;
        if (base.endsWith("/") && p.startsWith("/")) return base + p.slice(1);
        if (!base.endsWith("/") && !p.startsWith("/")) return base + "/" + p;
        return base + p;
    }
    _makeResult(confirm, status, httpStatus, errorObj, url, attempt, durationMs, retried, requestId, data) {
        return {
            confirm: !!confirm,
            status : status,
            httpStatus: (typeof httpStatus === "number") ? httpStatus : null,
            data   : data || null,
            error  : errorObj || null,
            meta   : {
                requestId : requestId || this._makeUUID(),
                attempt   : attempt || 0,
                retried   : !!retried,
                durationMs: Math.max(0, Math.round(durationMs || 0)),
                url       : url
            }
        };
    }
    async _smartParseResponse(res) {
        var ct = (res.headers.get("Content-Type") || "").toLowerCase();
        var out = { data: null, errorMessage: null, errorCode: null, raw: null };
        try {
            if (ct.indexOf("application/json") >= 0) {
                out.data = await res.json();
                if (!res.ok) {
                    out.errorMessage = (out.data && (out.data.message || out.data.error || out.data.msg)) || null;
                    out.errorCode    = (out.data && (out.data.code    || out.data.errorCode)) || null;
                }
            } else if (ct.indexOf("text/") >= 0) {
                var txt = await res.text();
                out.raw = txt;
                try { out.data = JSON.parse(txt); } catch(_) { out.data = txt; }
                if (!res.ok) out.errorMessage = (typeof out.data === "string") ? out.data.slice(0, 300) : null;
            } else {
                // blob/unknown
                try { out.raw = await res.blob(); } catch(_) { out.raw = null; }
                out.data = out.raw;
            }
        } catch(_) {
            out.errorMessage = "Gagal mem-parse respons server.";
            out.errorCode = "PARSE_ERROR";
        }
        return out;
    }
    _shouldRetryHTTP(res) {
        var s = res.status;
        return (s === 408 || s === 425 || s === 429 || (s >= 500 && s <= 599));
    }
    _statusFromHttp(s) {
        if (s === 429) return "THROTTLED";
        if (s === 408) return "TIMEOUT";
        if (s >= 500) return "SERVER_ERROR";
        if (s >= 400) return "CLIENT_ERROR";
        return "FAILED";
    }
    _readableFetchError(err, code) {
        if (code === "TIMEOUT") return "Timeout! Periksa koneksi.";
        if (code === "OFFLINE")    return "Offline. Cek koneksi.";
        if (code === "NETWORK_ERROR") return "Jaringan error. Cek koneksi.";
        if (code === "INVALID_ENDPOINT") return "Alamat server tidak ditemukan (DNS Error/Invalid URL).";
        if (code === "ABORTED") return "Permintaan dibatalkan.";
        return (err && err.message) || "Terjadi kesalahan jaringan.";
    }
    async _waitUntilVisible(ms) {
        if (typeof document === "undefined" || !document.hidden) return;
        return new Promise(function (resolve) {
            var t = setTimeout(function () { resolve(); }, Math.max(0, ms || 0));
            function onVis() {
                if (!document.hidden) { clearTimeout(t); resolve(); }
            }
            document.addEventListener("visibilitychange", onVis, { once: true });
        });
    }
    _safeToast(type, msg) {
        try {
            if (!msg) return;
            if (typeof STATIC !== "undefined" && typeof STATIC.toast === "function") {
                STATIC.toast(msg, type || "info");
            }
        } catch(_) {}
    }
}
const REQUEST = new RequestManager()
export default REQUEST