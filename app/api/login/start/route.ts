import { NextRequest, NextResponse } from "next/server";
import admin from 'firebase-admin'
import { convertChallenge, getNewChallenge, rp } from "@/app/lib/passkeyHelper";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { v4 } from "uuid";

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
    if (username == "" || username == undefined) {
        const options = await generateAuthenticationOptions({
            userVerification: "preferred",
            rpID: rp,
        })
        const sessionId = v4()
        let challenge = getNewChallenge();
        const challenges = firestore.collection('challenges').doc(sessionId)
        const convertedChallenge = convertChallenge(challenge)
        challenges.set({
            username: sessionId,
            challenge: options.challenge,
            expireAt: admin.firestore.Timestamp.fromDate(
                new Date(Date.now() + 5 * 60 * 1000)
            ),
        })

        const res = NextResponse.json({ options, sessionId })

        return res


    }
    const options = await generateAuthenticationOptions({
        userVerification: "preferred",
        rpID: rp,
        allowCredentials: [],

    })
    let challenge = getNewChallenge();
    const challenges = firestore.collection('challenges').doc(username)
    const users = firestore.collection('users').doc(username)
    const credentialID = (await users.get()).data()!["credentialID"]
    const convertedChallenge = convertChallenge(challenge)
    challenges.set({
        username: req.headers.get("username") as string || "",
        challenge: options.challenge,
        expireAt: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 5 * 60 * 1000)
        ),
    })

    const res = NextResponse.json({ options })

    return res
}
