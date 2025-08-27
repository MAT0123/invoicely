import { firestore } from 'firebase-admin'

class FirebaseBuilder {
    private db: firestore.Firestore | undefined = undefined
    constructor(admin: firestore.Firestore) {
        this.db = admin
        return this
    }
    build(): FirebaseBuilder {
        return this
    }
    


}