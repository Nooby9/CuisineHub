import { StyleSheet, Text, View, ScrollView, FlatList } from 'react-native'
import React from 'react'
import { Image } from 'react-native';

const RestaurantScreen = () => {
    // restaurant data should be fetched from api
    const restaurant = {
        name: 'KFC',
        type: 'Fast Food',
        rating: 4.0,
    };
    const renderImage = ({ item }) => (
        <Image source={{ uri: item }} style={styles.postImage} />
    );
  return (
    <ScrollView style={styles.container}>
        <FlatList
                data={["https://via.placeholder.com/300", "https://via.placeholder.com/300", "https://via.placeholder.com/300"]}
                renderItem={renderImage}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
            />
        <View style={styles.restaurantSection}>
            <View style={styles.restaurantDetail}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantRating}>Rating: {restaurant.rating}</Text>
            </View>
            <Text style={styles.restaurantType}>{restaurant.type}</Text>
        </View>
        <View style={styles.locationSection}>
            <View style={styles.locationLeft}>
                <Text style={styles.locationTitle}>Location: </Text>
                <Text style={styles.location}>1234 Street Name, City, State, 12345</Text>
            </View>
            <View style={styles.locationRight}>
                <Text>{">"}</Text>
            </View>
        </View>
    </ScrollView>

  )
}

export default RestaurantScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    postImage: {
        width: 300,
        height: 200,
        margin: 10,
        borderRadius: 10,
    },
    commentSection: {
        padding: 15,
        // backgroundColor: '#f9f9f9',
        // borderBottomWidth: 1,
        // borderBottomColor: '#eee',
    },
    comment: {
        fontSize: 14,
        color: '#333',
    },
    restaurantSection: {
        padding: 15,
        borderColor: 'white',
        borderWidth:8,
        borderRadius: 15,
        backgroundColor: 'lemonchiffon',
    },
    restaurantInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    restaurantDetail:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom:5
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    restaurantRating: {
        marginHorizontal:5,
        fontSize: 16,
        color: '#777',
    },
    restaurantType:{
        fontSize: 15,
        color: '#777',
    },
    restaurantReviews: {
        fontSize: 12,
        color: '#777',
    },
    dateLocationSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        // borderBottomWidth: 1,
        // borderBottomColor: '#eee',
    },
    date: {
        fontSize: 14,
        color: '#777',
        marginRight: 10
    },
    location: {
        fontSize: 14,
        color: '#777',
    },
    commentsSection: {
        padding: 15,
    },
    commentsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
      },
    //   commentContainer: {
    //     marginBottom: 15,
    //   },
      commentItem: {
        padding: 10,
        // borderColor: '#eee',
        // borderWidth: 1,
        // borderRadius: 8,
        // backgroundColor: '#f9f9f9',
      },
      commentAuthor: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
      },
      divider: {
        height: 1,
        backgroundColor: 'rgba(204, 204, 204, 0.3)',
        marginVertical: 5,
      },
      locationSection: {
        padding: 15,
        borderColor: 'white',
        borderWidth:8,
        borderRadius: 15,
        backgroundColor: 'lemonchiffon',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      locationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
      },
      location: {
        fontSize: 14,
        paddingTop: 5,
      },

});