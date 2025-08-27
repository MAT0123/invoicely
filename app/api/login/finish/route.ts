import { NextRequest, NextResponse } from "next/server";
import admin from 'firebase-admin'
import { b64urlToUint8, convertChallenge, getNewChallenge, rp } from "@/app/lib/passkeyHelper";
import * as SimpleWebAuthnServer from '@simplewebauthn/server'
import { sign } from 'jsonwebtoken'; // or a session lib
import { WebAuthnCredential, AuthenticatorTransportFuture } from '@simplewebauthn/types'
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
    const username = req.headers.get("username") as string || ""
    const body = await req.json()
    if (username === "" || username === undefined) {
        return NextResponse.json({
            error: 'Username required'
        }, {
            status: 400,
        })
    }
    if (body === null) {
        return NextResponse.json({
            error: 'Body required'
        }, {
            status: 400,
        })
    }
    let verification;
    const challenges = firestore!.collection('challenges').doc(username)
    const users = firestore!.collection('users').doc(username)
    const challengesData = (await challenges.get()).data()
    if (challengesData == undefined) {
        return NextResponse.json({
            error: 'Please start the passkey registration process again'
        }, {
            status: 400,
        })
    }
    type Credential = {
        convertedCredential: string
        id: string
        counter: number
        transport?: AuthenticatorTransportFuture[]
    }
    const user = (await users.get()).data()
    if (!user) {
        return NextResponse.json({
            error: "Credential does not exist"
        }, { status: 400 })
    }
    const credentials = user["credential"] as Credential
    const pubKey = b64urlToUint8(credentials.convertedCredential)
    const expectedChallenge = challengesData["challenge"]


    try {

        verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
            expectedChallenge,
            response: body,
            credential: {
                ...credentials,
                publicKey: pubKey,
            },
            expectedRPID: rp,
            expectedOrigin: "http://localhost:3000",
            requireUserVerification: false
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error
        }, { status: 400 })
    }

    const { verified } = verification

    if (verified) {
        const token = sign({ sub: username, userId: username, loginDate: Date.now() }, process.env.JWT_SECRET!, { expiresIn: "7d" })
        const res = NextResponse.json({
            status: "SUCCESS"
        }, { status: 200 })

        res.cookies.set("passkey", username, {
            maxAge: 60 * 60 * 24 * 7
        })
        res.cookies.set("invoicely-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV == "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        return res
    }

    return NextResponse.json({
        status: "UNKNOWN"
    }, { status: 200 })
}
