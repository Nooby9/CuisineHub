import { addDoc, deleteDoc, updateDoc, collection, getDocs, doc } from 'firebase/firestore';
import { database } from './firebaseSetup';


export async function writeToDB(data, collectionName) {
    try {
        const docID = await addDoc(collection(database, collectionName), data);
        console.log("Document written with ID: ", docID.id);
    }
    catch (e) {
        console.error("Write to db: ", e);
    }
}