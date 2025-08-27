"use server"
// export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server";
import { verify } from 'jsonwebtoken'

export function middleware(req: NextRequest) {

    const cookie = req.cookies.get("invoicely-token")
    if (cookie != undefined || cookie != null) {
        try {
            const isValid = verify(cookie.value, process.env.JWT_SECRET!, function verify(e) {
                if (e == null) {
                    NextResponse.redirect("/")
                }

            })
        } catch (error) {
            console.log(error)
        }


    }
    return NextResponse.next()

}
export const config = {

}