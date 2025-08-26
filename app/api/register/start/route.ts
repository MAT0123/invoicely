import { NextRequest, NextResponse } from "next/server";


const rp = "invoicely.matthewautjoa.tech"
let fakeMemoryForChallenge: Record<string, string> = {}
export const POST = (req: NextRequest): NextResponse => {
    const username = req.headers.get("username") as string || ""

    if (username === "") {
        return NextResponse.json({
            error: 'Username required'
        }, {
            status: 400,
        })
    }
    let challenge = getNewChallenge();
    fakeMemoryForChallenge[username] = challenge
    fakeMemoryForChallenge[username] = convertChallenge(challenge);
    const pubKey = {
        challenge: challenge,
        rp: { id: rp, name: 'Invoicely' },
        user: { id: username, name: username, displayName: username },
        pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
            requireResidentKey: false,
        }
    };

    return NextResponse.json({
        pubKey
    }, { status: 200 })
}

function getNewChallenge() {
    return Math.random().toString(36).substring(2);
}
function convertChallenge(challenge: string) {
    return btoa(challenge).replaceAll('=', '');
}