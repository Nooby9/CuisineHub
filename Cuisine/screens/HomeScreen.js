import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import PostItem from '../components/PostItem'; // Ensure correct import path
import { subscribeToCollection } from '../Firebase/firestoreHelper';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { database } from '../Firebase/firebaseSetup';

const COLLECTION_NAME = 'Post'; // Define your collection name

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(database, COLLECTION_NAME),
      (querySnapshot) => {
        let postsArray = [];
        console.log("log1====",querySnapshot.length)
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            postsArray.push({ ...doc.data(), id: doc.id });
          });
        }
        setPosts(postsArray);
      });
    // detach the listener when we no longer need to listen
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
          data={posts}
        // data={sampleData}
        renderItem={({ item }) => <PostItem item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
});

export default HomeScreen;



// export default function HomeScreen() {
//   return (
//     <ScrollView style={styles.container}>

//       <View style={styles.contentGrid}>
//         {sampleData.map(item => (
//           <View key={item.id} style={styles.card}>
//             <Image source={{ uri: item.image }} style={styles.cardImage} />
//             <Text style={styles.cardTitle}>{item.title}</Text>
//             <View style={styles.cardFooter}>
//               <Text style={styles.cardAuthor}>{item.author}</Text>
//               <View style={styles.likeSection}>
//                 <Icon name="heart-outline" size={16} color="#aaa" />
//                 <Text style={styles.cardLikes}>{item.likes}</Text>
//               </View>
//             </View>
//           </View>
//         ))}
//       </View>
//     </ScrollView>
//   )
// }

// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: '#fff',
//     },
//     header: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       padding: 10,
//       borderBottomWidth: 1,
//       borderBottomColor: '#eee',
//     },
//     city: {
//       fontSize: 18,
//       fontWeight: 'bold',
//       marginRight: 10,
//     },
//     searchBar: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       backgroundColor: '#f1f1f1',
//       flex: 1,
//       paddingVertical: 5,
//       paddingHorizontal: 10,
//       borderRadius: 5,
//       marginRight: 10,
//     },
//     searchText: {
//       fontSize: 14,
//       color: '#aaa',
//       marginLeft: 5,
//     },
//     scanButton: {
//       padding: 5,
//     },
//     tabs: {
//       flexDirection: 'row',
//       justifyContent: 'space-around',
//       paddingVertical: 10,
//       backgroundColor: '#fff',
//       borderBottomWidth: 1,
//       borderBottomColor: '#eee',
//     },
//     tab: {
//       paddingVertical: 5,
//       paddingHorizontal: 10,
//     },
//     tabActive: {
//       paddingVertical: 5,
//       paddingHorizontal: 10,
//       borderBottomWidth: 2,
//       borderBottomColor: '#ff6347',
//     },
//     tabText: {
//       fontSize: 14,
//       color: '#aaa',
//     },
//     tabTextActive: {
//       fontSize: 14,
//       color: '#ff6347',
//       fontWeight: 'bold',
//     },
//     contentGrid: {
//       padding: 10,
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       justifyContent: 'space-between',
//     },
//     card: {
//       width: '48%',
//       backgroundColor: '#fff',
//       marginBottom: 10,
//       borderRadius: 10,
//       overflow: 'hidden',
//       borderWidth: 1,
//       borderColor: '#eee',
//     },
//     cardImage: {
//       width: '100%',
//       height: 120,
//     },
//     cardTitle: {
//       padding: 10,
//       fontSize: 14,
//       color: '#333',
//     },
//     cardFooter: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       paddingHorizontal: 10,
//       paddingBottom: 10,
//     },
//     cardAuthor: {
//       fontSize: 12,
//       color: '#777',
//     },
//     likeSection: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
//     cardLikes: {
//       fontSize: 12,
//       color: '#777',
//       marginLeft: 5,
//     },
//     placeholder: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: '#fff',
//     },
//   });
