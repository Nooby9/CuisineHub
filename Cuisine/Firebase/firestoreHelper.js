import { addDoc, deleteDoc, collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { database } from './firebaseSetup';
import { firestore } from './firebaseSetup'; // Ensure correct Firebase import

// Function to fetch array data (e.g., likedBy) from a specific document
export const fetchArrayDataByField = async (collectionName, docId, field) => {
  try {
    // Create a reference to the specific document in the specified collection
    const documentRef = doc(database, collectionName, docId);
    const document = await getDoc(documentRef);

    if (!document.exists()) {
      console.error('Document does not exist:', docId);
      return [];
    }

    // Get the array from the specified field or default to an empty array
    const fieldDataArray = document.data()[field] || [];
    return fieldDataArray;
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    throw error;
  }
};

// Function to update the array field (e.g., likedBy) in a specific document
export const updateLikeStatus = async (collectionName, docId, likedByField, userId, isLiking) => {
  try {
    // Create a reference to the specific document in the specified collection
    const documentRef = doc(database, collectionName, docId);

    if (isLiking) {
      // If the user is liking the document, add their ID to the array
      await updateDoc(documentRef, {
        [likedByField]: arrayUnion(userId),
      });
    } else {
      // If the user is unliking the document, remove their ID from the array
      await updateDoc(documentRef, {
        [likedByField]: arrayRemove(userId),
      });
    }
  } catch (error) {
    console.error('Error updating array field in Firestore:', error);
    throw error;
  }
};

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

export async function getUserName(userId) {
  try {
      // Get the document reference for the user's data
      const userDoc = await getDoc(doc(database, 'User', userId));

      if (userDoc.exists()) {
          // Extract user data from the document
          const userData = userDoc.data();  // Ensure userData is defined here

          // Return the user's name if it exists
          if (userData.username) {
              return userData.username;
          } 
      } 
      else {
          return "Anonymous";
      }
  } catch (e) {
      console.error('Error getting user name: ', e);
      return null;
  }
}

export const deleteFromDB = async (docId, collectionName) => {
    try {
         // Get a reference to the document you want to delete
         const docRef = doc(database, collectionName, docId);
         // Delete the document
         await deleteDoc(docRef);
         
         console.log('Document successfully deleted!');
    } catch (error) {
        console.error('Error removing document: ', error);
        throw error;
    }
};


export async function writeWithIdToDB(data, collectionName, id){
  try{
      await setDoc(doc(database, collectionName, id), data, {merge: true});
  }
  catch(e) {
      console.error("Writing to database with id error: ", e);
  }
}

export async function deleteWithIdFromDB(collectionName, id){
  try{
      await deleteDoc(doc(database, collectionName, id));
  }
  catch(e) {
      console.error("Delete from database with id error: ", e);
  }
}

export async function checkIfDocExists(collectionName, id){
  try{
      const docRef = doc(database, collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
  }
  catch(e) {
      console.error("Check if doc exists error: ", e);
  }
}

export async function getFavoriteRestaurants(userId){
  try{
      const favoriteRestaurantsCollection = collection(database, `User/${userId}/FavoriteRestaurant`);
      const favoriteRestaurantsSnapshot = await getDocs(favoriteRestaurantsCollection);
      const favoriteRestaurants = favoriteRestaurantsSnapshot.docs.map(doc => doc.data());
      return favoriteRestaurants;
  }
  catch(e) {
      console.error("Get favorite restaurants error: ", e);
  }
}




