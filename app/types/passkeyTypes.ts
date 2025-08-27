

export type PublicKeyOptions = {
    challenge: string;
    rp: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        name: string;
        displayName: string;
    };
    pubKeyCredParams: {
        type: string;
        alg: number;
    }[];
    authenticatorSelection: {
        authenticatorAttachment: string;
        userVerification: string;
        residentKey: string;
        requireResidentKey: boolean;
    };
};

export type WebAuthnOptions = {
    challenge: string;
    rp: string;
    allowCredentials: {
        type: string;
        id: any;
        transports: string[];
    }[];
    userVerification: string;
};
