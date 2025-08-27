import { NextRequest, NextResponse } from "next/server";
import admin from 'firebase-admin'
import { b64urlToUint8, convertChallenge, getNewChallenge, rp } from "@/app/lib/passkeyHelper";
import { PasskeyError } from "@/app/types/passkeyError";
import { generateRegistrationOptions } from "@simplewebauthn/server";

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        }),
        databaseURL: "invoicely-f9dec.firebasestorage.app"
    });
}
const firestore = admin.firestore()
export const POST = async (req: NextRequest): Promise<NextResponse> => {
    const username = req.headers.get("username") as string

    if (username === "" || username == undefined) {
        return NextResponse.json({
            error: 'Username required'
        }, {
            status: 400,
        })
    }
    const pubKey = await generateRegistrationOptions({
        rpID: rp,
        rpName: "Invoicely",
        userName: username,
        userID: Uint8Array.from([username]),
        authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'required',
        },
    })
    const usernameSnapshot = await firestore.collection('users').doc(username).get()
    const exist = usernameSnapshot.exists
    // If user is not new in the platform but might not have a passkey (e.g registered using email)
    if (exist) {
        // If user has passkey previously but not on this device / browser
        const credentialId = usernameSnapshot.data()
        if (credentialId) {
            pubKey.excludeCredentials = [
                {
                    id: credentialId["credentialId"],
                    type: "public-key"
                }
            ]
        }
    }

    await firestore.collection('challenges').doc(username).set({
        username: req.headers.get("username") as string || "",
        challenge: pubKey.challenge,
        expireAt: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 5 * 60 * 1000)
        ),
    })

    return NextResponse.json({
        pubKey
    }, { status: 200 })
}
