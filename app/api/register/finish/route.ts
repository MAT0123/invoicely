import { NextRequest, NextResponse } from "next/server";
import * as SimpleWebAuthnServer from '@simplewebauthn/server'
import admin from 'firebase-admin'
import { rp, setPasskeyCookie } from "@/app/lib/passkeyHelper";
import { WebAuthnCredential, AuthenticatorTransportFuture } from '@simplewebauthn/types'
import { sign } from "jsonwebtoken";
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        }),
        databaseURL: "invoicely-f9dec.firebasestorage.app"
    });
    admin.firestore().settings({ ignoreUndefinedProperties: true })
}
let firestore = admin.firestore()
export const POST = async (req: NextRequest): Promise<NextResponse> => {
    const username = req.headers.get("username") as string || ""
    const body = await req.json()
    console.log(body)
    if (username === "") {
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

    const challengesData = (await challenges.get()).data()
    if (challenges === null) {
        return NextResponse.json({
            error: 'Please start the passkey registration process again'
        }, {
            status: 400,
        })
    }

    try {
        verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
            response: body,
            expectedChallenge: challengesData!["challenge"],
            expectedOrigin: `http://localhost:3000`,
            expectedRPID: `${rp}`,
            requireUserPresence: false,
            requireUserVerification: false
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error
        }, { status: 400 })
    }
    const { verified, registrationInfo } = verification;


    let {
        fmt,
        aaguid,
        credential,
        credentialType,
        attestationObject,
        userVerified,
        credentialDeviceType,
        credentialBackedUp,
        origin
    } = registrationInfo as any
    let credentialTransport = (credential as WebAuthnCredential).transports
    const convertedCredential = Buffer.from((credential as WebAuthnCredential).publicKey).toString('base64')

    const { id,
        counter } = (credential as WebAuthnCredential)
    const users = firestore!.collection('users').doc(username)
    const credentialToUser = firestore!.collection('credentialToUser').doc(id)

    const o: Record<string, string | number | {}> = {
        fmt, aaguid,
        credentialType,
        attestationObject,
        userVerified,
        credentialDeviceType,
        credentialBackedUp,
        origin,
    }
    const cred: Record<string, any> = {
        convertedCredential,
        id,
        counter
    }
    if (credentialTransport !== undefined) {
        cred["transport"] = credentialTransport
    }
    o["credential"] = cred
    if (verified) {
        await credentialToUser.create({
            username
        })

        await users.create({
            o,
            credentialId: registrationInfo?.credential.id
        });
        const token = sign({ sub: username }, process.env.JWT_SECRET!, { expiresIn: "7d" })
        const fb_token = await admin.auth().createCustomToken(username)
        const tempRes = NextResponse.json({
            fb_token
        }, { status: 200 })

        //const cookie = setPasskeyCookie(tempRes, username, token)
        tempRes.cookies.set("passkey", username, {
            maxAge: 60 * 60 * 24 * 7
        })
        tempRes.cookies.set("invoicely-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        //return cookie
        return tempRes
    }

    return NextResponse.json({
        status: "UNKNOWN"
    }, { status: 404 })
}

