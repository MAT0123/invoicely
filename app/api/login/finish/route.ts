import { NextRequest, NextResponse } from "next/server";
import admin from 'firebase-admin'
import { b64urlToUint8, rp } from "@/app/lib/passkeyHelper";
import * as SimpleWebAuthnServer from '@simplewebauthn/server'
import { sign } from 'jsonwebtoken'; // or a session lib
import { AuthenticationResponseJSON, AuthenticatorTransportFuture } from '@simplewebauthn/types'
import { Credential } from "@/app/types/passkeyTypes";
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

    try {

        const body = await req.json()
        if (body === null) {
            return NextResponse.json({
                error: 'Body required'
            }, {
                status: 400,
            })
        }
        const attess = body.attes as AuthenticationResponseJSON

        let username
        let sessionId = req.headers.get("sessionId") as string
        console.log(`attesss_server${JSON.stringify(attess)}`)
        const mappingSnapshot = firestore!.collection('credentialToUser').doc(attess.id || attess.rawId)

        if (!username) {

            const rawId = (await mappingSnapshot.get()).data()
            if (rawId) {
                username = rawId["username"]
            }
            else {
                return NextResponse.json({
                    error: 'Username required'
                }, {
                    status: 400,
                })
            }

        }
        //if user has multiple log in route (e.g passkey and email)
        //const credId = firestore!.collection('users').doc(attess.rawId ?? username).id
        console.log(username)
        let verification;
        const challenges = firestore!.collection('challenges').doc(sessionId)
        const users = firestore!.collection('users').doc(username)

        const challengesData = (await challenges.get()).data()
        if (challengesData == undefined) {
            return NextResponse.json({
                error: 'Please start the passkey registration process again'
            }, {
                status: 400,
            })
        }

        const user = (await users.get()).data()
        if (!user) {
            return NextResponse.json({
                error: "Credential does not exist"
            }, { status: 400 })
        }
        console.log(user)
        const credentials = user["o"]["credential"] as Credential
        console.log(`credentials_server_converted${JSON.stringify(credentials)}`)
        const pubKey = b64urlToUint8(credentials.convertedCredential)
        const expectedChallenge = challengesData["challenge"]


        try {
            verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
                expectedChallenge,
                response: attess,
                credential: {
                    publicKey: pubKey,
                    id: credentials.id,
                    transports: credentials.transport as AuthenticatorTransportFuture[],
                    counter: credentials.counter
                },
                expectedRPID: rp,
                expectedOrigin: origin,
                requireUserVerification: false,

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
            const user = await admin.auth().getUserByEmail(username);

            await admin.auth().setCustomUserClaims(user.uid, {
                email: username,
                test: "123"
            })
            const fb_token = await admin.auth().createCustomToken(user.uid, {
                email: username,
                attesId: attess.id ?? attess.rawId,
                passkey: true
            })

            const res = NextResponse.json({
                token: fb_token
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
        }, { status: 400 })
    } catch (e) {
        return NextResponse.json({
            error: e instanceof Error ? e.message : "Verification failed",
            details: e instanceof Error ? e.stack : JSON.stringify(e)
        }, { status: 400 })
    }

}
