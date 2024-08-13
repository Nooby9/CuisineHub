import { addDoc, deleteDoc, updateDoc, collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
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

export async function updateDB(id, data, collectionName) {
    try{
        await updateDoc(doc(database, collectionName, id), data);
    }
    catch(e) {
        console.error("Update db: ", e);
    }
}

export async function getUserInfoDB(userId) {
    try {
      const userDoc = await getDoc(doc(database, 'User', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (e) {
      console.error('Error getting document: ', e);
    }
  }

export async function getSavedPosts(userId) {
  try {
      const savedPostsCollection = collection(database, `User/${userId}/SavedPosts`);
      const savedPostsSnapshot = await getDocs(savedPostsCollection);
      const savedPostIds = savedPostsSnapshot.docs.map(doc => doc.data().PostID);
      return savedPostIds;
  } catch (e) {
      console.error('Error getting saved posts: ', e);
  }
}

export async function writeWithIdToDB(data, collectionName, id){
  try{
      await setDoc(doc(database, collectionName, id), data, {merge: true});
  }
  catch(e) {
      console.error("Writing to database with id error: ", e);
  }
}

export async function deletWithIdFromDB(collectionName, id){
  try{
      await deleteDoc(doc(database, collectionName, id));
  }
  catch(e) {
      console.error("Delete from database with id error: ", e);
  }
}




