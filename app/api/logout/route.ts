import { verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const cookie = request.cookies.get("invoicely-token")
    if (!cookie) {
        return NextResponse.json({
            message: "You are not signed in"
        }, { status: 400 })
    }
    try {
        const res = NextResponse.json({ message: "Logged out" }, { status: 200 })

        const ver = verify(cookie.value, process.env.JWT_SECRET!, function er(err) {
            res.cookies.delete("invoicely-token")
            res.cookies.delete("passkey")
            return res
        })

        return res
    } catch (e) {
        console.log(e)
        return NextResponse.json({
            message: e
        }, { status: 400 })
    }

    return NextResponse.json({
        message: "Something wrong happened"
    }, { status: 400 })


}