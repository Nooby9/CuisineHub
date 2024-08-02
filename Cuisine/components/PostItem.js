import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PressableButton from './PressableButton';

const PostItem = ({ item }) => {
  const [likes, setLikes] = useState(item.likes);

  const handleLikePress = () => {
    setLikes(likes + 1);
  };

  return (
    <Pressable style={styles.card} onPress={() => console.log('Item pressed', item.title)}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardAuthor}>{item.author}</Text>
        <PressableButton onPress={handleLikePress}>
          <View style={styles.likeSection}>
          <Icon name="heart-outline" size={16} color="#aaa" />
          <Text style={styles.cardLikes}>{likes}</Text>
          </View>
        </PressableButton>
      </View>
    </Pressable>
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
  },
  cardAuthor: {
    fontSize: 12,
    color: '#777',
  },
  likeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLikes: {
    fontSize: 12,
    color: '#777',
    marginLeft: 5,
  },
});

export default PostItem;
