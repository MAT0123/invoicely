// import { NextRequest, NextResponse } from "next/server";
// import * as SimpleWebAuthnServer from '@simplewebauthn/server'
// import base64url from 'base64url'

// const rp = "www.invoicely.matthewautjoa.tech"
// let fakeMemoryForChallenge: Record<string, string> = {}
// export const POST = async (req: NextRequest): NextResponse => {
//     const username = req.headers.get("username") as string || ""

//     if (username === "") {
//         return NextResponse.json({
//             error: 'Username required'
//         }, {
//             status: 400,
//         })
//     }
//     let verification;
//     try {
//         verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
//             response: req.body.data,
//             expectedChallenge: challenges[username],
//             expectedOrigin: expectedOrigin
//         });
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json({
//             error
//         }, { status: 400 })
//     }
//     const { verified, registrationInfo } = verification;
//     if (verified) {
//         users[username] = registrationInfo;
//         return res.status(200).send(true);
//     }

//     return NextResponse.json({
//         status: "SUCCESS"
//     }, { status: 200 })
// }

// function getNewChallenge() {
//     return Math.random().toString(36).substring(2);
// }
// function convertChallenge(challenge: string) {
//     return btoa(challenge).replaceAll('=', '');
// }