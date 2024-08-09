import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PressableButton from './PressableButton';
import { useNavigation } from '@react-navigation/native';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../Firebase/firebaseSetup'; // Import Firebase storage setup
import { colors,commonStyles } from '../style';

const PostItem = ({ item }) => {
  const [likes, setLikes] = useState(item.likes);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchImageUrl() {
      try {
        const imageRef = ref(storage, item.imageUrls[0]);
        const url = await getDownloadURL(imageRef);
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image URL:', error);
        // Optionally set a fallback image or handle error
      }
    }

    if (item.imageUrls && item.imageUrls[0]) {
      fetchImageUrl();
    }
  }, [item.imageUrls]);

  const handleLikePress = () => {
    setIsFavorite(!isFavorite);
    if(isFavorite){
      setLikes(likes + 1);
    }else{
      setLikes(likes - 1);
    }
    
  };

  const handlePostPress = () => {
    navigation.navigate('Post', { post: item });
  };

  return (
    <View style={styles.card}>
    <Pressable   onPress={handlePostPress}>
      <Image source={{ uri: imageUrl || 'fallback_image_url' }} style={styles.cardImage} />
      <Text style={styles.cardTitle}>{item.title}</Text>
      </Pressable>
      <View style={styles.cardFooter}>
        <Text style={styles.cardAuthor}>{item.author}</Text>

        <View style={commonStyles.likeSection}>
          <PressableButton onPress={handleLikePress}>
          <Icon
          name={isFavorite ? 'heart' : 'heart-outline'} // Toggle between filled and outline
          size={18}
          color={isFavorite ? colors.favorite : colors.notFavorite} // Toggle color
        />
          </PressableButton>
          <Text style={commonStyles.cardLikes}>{likes}</Text>
        </View>
      </View>
    
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'column', // Arrange children vertically
    justifyContent: 'space-between', // Distribute space to move footer to bottom
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardTitle: {
    padding: 10,
    fontSize: 14,
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginTop: 'auto', // Pushes footer to the bottom
  },
  cardAuthor: {
    fontSize: 12,
    color: '#777',
  },
});

export default PostItem;
