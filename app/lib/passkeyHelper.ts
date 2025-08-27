import { NextResponse } from "next/server";
import { PublicKeyOptions, WebAuthnOptions } from "../types/passkeyTypes";
import { PublicKeyCredentialHint, startRegistration } from "@simplewebauthn/browser";
import { PublicKeyCredentialDescriptorJSON } from '@simplewebauthn/types'

export function getNewChallenge() {
    return Math.random().toString(36).substring(2);
}
export function convertChallenge(challenge: string) {
    return btoa(challenge).replaceAll('=', '');
}

export const b64urlToUint8 = (input: unknown): Uint8Array => {
    if (input instanceof Uint8Array) return input;
    if (input instanceof ArrayBuffer) return new Uint8Array(input);
    if (typeof input !== 'string' || input.length === 0) {
        throw new Error('b64urlToUint8: missing/invalid input');
    }
    const pad = '='.repeat((4 - (input.length % 4)) % 4);
    const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
    const raw = atob(b64);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
};

export const toBytes = (v: any, field: string) => {
    try { return b64urlToUint8(v); }
    catch {
        if (typeof v === 'string') return new TextEncoder().encode(v); // fallback if server sent plain text
        throw new Error(`Invalid ${field}`);
    }
};
export function b64encode(bytes: Uint8Array) {
    let s = '';
    bytes.forEach(b => (s += String.fromCharCode(b)));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
export function setPasskeyCookie(res: NextResponse, username: string, token: string) {

    res.cookies.set("passkey", username, {
        maxAge: 60 * 60 * 24 * 7
    })
    res.cookies.set("invoicely-token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return res
}
// export function prepRegistrationOptions(opts: PublicKeyOptions | { pubKey: PublicKeyOptions }) {
//     const o = (opts as any).pubKey as PublicKeyOptions ?? opts
//     const publicKey: PublicKeyCredentialCreationOptions = {
//         ...opts,
//         rp: o.rp,
//         challenge: toBytes(o.challenge, 'challenge').buffer as ArrayBuffer,
//         user: {
//             ...o.user,
//             id: toBytes(o.user.id, 'user.id').buffer as ArrayBuffer,
//         },
//         pubKeyCredParams: o.pubKeyCredParams as PublicKeyCredentialParameters[],
//         authenticatorSelection: o.authenticatorSelection as AuthenticatorSelectionCriteria,

//     };

//     return publicKey;
// }
export function prepRegistrationOptions(opts: PublicKeyCredentialCreationOptionsJSON | { pubKey: PublicKeyCredentialCreationOptionsJSON }) {
    const o = (opts as any).pubKey as PublicKeyCredentialCreationOptionsJSON ?? opts
    const attes = o.attestation
    const publicKey: PublicKeyCredentialCreationOptions = {
        ...opts,
        rp: o.rp,
        challenge: toBytes(o.challenge, 'challenge').buffer as ArrayBuffer,
        user: {
            ...o.user,
            id: toBytes(o.user.id, 'user.id').buffer as ArrayBuffer,
        },
        pubKeyCredParams: o.pubKeyCredParams as PublicKeyCredentialParameters[],
        authenticatorSelection: o.authenticatorSelection as AuthenticatorSelectionCriteria,
        extensions: o.extensions as AuthenticationExtensionsClientInputs,
        timeout: o.timeout,
        attestation: attes as AttestationConveyancePreference | undefined,
        excludeCredentials: o.excludeCredentials as PublicKeyCredentialDescriptor[] | undefined
    };

    return publicKey;
}
export function prepLoginsOptions(opts: WebAuthnOptions | { pubKey: WebAuthnOptions }) {
    const o = (opts as any).pubKey as WebAuthnOptions ?? opts
    const publicKey: PublicKeyCredentialRequestOptions = {
        ...opts,
        rpId: o.rp,
        challenge: toBytes(o.challenge, 'challenge').buffer as ArrayBuffer,
        userVerification: o.userVerification as UserVerificationRequirement,
        allowCredentials: o.allowCredentials.map((e) => ({
            type: e.type as "public-key",
            id: typeof e.id === 'string' ? toBytes(e.id, 'credential.id').buffer as ArrayBuffer : e.id,
            transports: e.transports as AuthenticatorTransport[],
        }))

    };

    return publicKey;
}
export async function registerPasskey(username: string) {
    let options = await fetch('/api/register/start', {
        method: "POST",
        headers: {
            username
        }
    })
    const json: any = await options.json()
    const pubKey = json.pubKey as PublicKeyCredentialCreationOptionsJSON
    console.log(`client_register: pubKey${pubKey}`)

    console.log(pubKey)
    if (!pubKey || !pubKey.challenge) {
        throw new Error('Missing challenge in server response');
    }

    let asseResp;

    asseResp = await startRegistration({
        optionsJSON: {
            ...pubKey,
            attestation: pubKey.attestation as AttestationConveyancePreference | undefined,
            hints: pubKey.hints as PublicKeyCredentialHint[] | undefined,
            excludeCredentials: Array.isArray(pubKey.excludeCredentials)
                ? pubKey.excludeCredentials.map((ec) => ({
                    type: "public-key",
                    id: ec.id,
                    transports: ec.transports as string[] | undefined,
                })) as PublicKeyCredentialDescriptorJSON[]
                : undefined
        }
    });

    console.log(`asseResp${JSON.stringify(asseResp)}`)
    const sendRes = await fetch('/api/register/finish', {
        method: "POST",
        headers: {
            username,
            "content-type": "application/json"
        },
        body: JSON.stringify(asseResp)
    })

    return sendRes.status
}
export const rp = process.env.NODE_ENV == "production" ? "invoicely.matthewautjoa" : "localhost"
