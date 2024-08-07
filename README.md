<a name="GE4oU"></a>

# CuisineHub

<a name="XNEEc"></a>

## 1. Overview

**Cuisine Hub** is your ultimate guide to discovering and reviewing the best restaurants around you! Whether you're a casual diner or a gourmet enthusiast, Cuisine Hub makes it easy to find new dining spots, share your experiences, and read honest reviews from fellow food lovers. Turn every meal into an adventure with Cuisine Hub.<br />**Key Features**:<br />● **Explore Nearby**: Discover the best restaurants around you with our expertly curated recommendations, complete with user reviews and ratings to guide your next meal.<br />● **Search for Cuisine**: Easily search for specific types of cuisine, dishes, or restaurants to satisfy your cravings.  <br />● **Capture and Share**: Snap and upload stunning photos of your meals, tag the restaurant, and write detailed reviews to share your dining experiences.<br />● **Personal Food Journal**: Keep a beautifully organized log of all your restaurant visits and reviews, creating a personalized food diary.<br />● **Local Notifications**: Set reminders for upcoming restaurant visits to ensure you never miss out on the best culinary experiences.<br />Cuisine Hub transforms dining into a memorable experience. Join us to savor, share, and connect with a world of culinary delights. Make every meal count and start your delicious journey today!
<a name="AlcyB"></a>

## 2. Installation

1. **Install dependencies:**

```
cd Cuisine
npm install
```

2. **Set up environment variables:**

Create a `.env` file in the root directory and add your Google Places API Key and Firebase configuration:

```
googlePlacesApiKey=YOUR_GOOGLE_PLACES_API_KEY
apiKey=your-firebase-api-key
authDomain=your-firebase-auth-domain
projectId=your-firebase-project-id
storageBucket=your-firebase-storage-bucket
messagingSenderId=your-firebase-messaging-sender-id
appId=your-firebase-app-id
```

3. **Run the app:**

```
npx expo start --tunnel
```

<a name="SzqPI"></a>

## 3. Data Model

<a name="MzNW4"></a>

### 1. Post

- **title (String):** The title of the post.
- **images (Array):** URLs of uploaded images.
- **place_id (String):** The Google Place ID of the restaurant.
- **author (String):** The author of the post (defaults to "Anonymous" if not provided).
- **comment (String):** The author's content of the post.
- **likes (Number):** Number of likes on the post.
- **date (String):** The date the post was created in YYYY-MM-DD format.
- **comments (Array):** List of other uers' comments on the post.
  
  

### 2. User

- **email (String):** The email of the user.
- **name (String):** The name of the user.
- **photoUrl (String):** The profile photo of the user.

### 3. SavedPosts (A User Subcollection)
- **PostID (String):** The post id for the user's favorite/saved post.

## 4. Collections and  CRUD Operations  

<a name="Fmiz4"></a>

### 1. Post

- **Description:** Stores all user posts with details about their dining experiences.  Each post includes:  title, comment, images, other users' comments,  etc.
- **CRUD Operations:**
  - **Create:** Implemented in the `PostEditorScreen` where users can create a new post.
  - **Read:** 
    - **User Profile:** Users can view and manage their own posts, displaying all their dining experiences in the format of map and list.
    - **DiscoverScreen:** Fetches popular and recent posts shared by other users, helping users discover new and trending dining spots. Posts are sorted based on metrics like the number of likes to highlight popular experiences.
  - **Update:** Users can update posts from their journal.
  - **Delete:** Posts can be deleted directly from the user's journal.
    <a name="Hj0Y9"></a>

### 2. User
- **Description:** Stores all users with details about their profile information.
- **CRUD Operations:**
  - **Create:** This should get the auth.id from the authenticaiton step when a user first registers from the platform. (Not implemented)
  - **Read:** 
    - **User Profile:** User can see their personal profile information with their image. 
  - **Update:** Users can update their profile from the profile page. (To be implemented, a function for updating the database is in place.)
  - **Delete:** We have to decide whether a user can delete their profile/account. (To-do)
    <a name="Hj0Y9"></a>

<a name="HvvcR"></a>

### 3. Saved Posts/Favorites
- **Description:** Stores ids of all favorited posts a user has liked. 
- **CRUD Operations:**
  - **Create:** Adds the id of a post to the SavedPosts subcollection in User.
  - **Read:** 
    - **Saved Posts Screen:** Reads the id from SavedPosts and gets the post detail from the post collection. 
  - **Delete:** Remove the saved post id from the subcollection. 
    <a name="Hj0Y9"></a>
<a name="Pf563"></a>

## 5. Team Members

Huijia Wang<br />Shurui Xu
<a name="FUFaj"></a>

## 6. Iteration Record

<a name="Se3Yo"></a>

### 6.1 Iteration 1

<a name="oCBbn"></a>

#### Huijia Wang

<a name="YcsAz"></a>

#### Shurui Xu
- Set-up the initial expo app and firebase connection
- Set-up Google places API key from Google Cloud
- Created search and restaurant screen
- Displays restaurant details (name, ratings, photos, location, opening hour) from Google places details API in restaurant screen
- Used Google places search API to search restaurants nearby
- Created profile screen
- Read profile information from database
- Created saved posts/favorite screen
- Use PostItem in saved posts screen to display all the posts that a user has saved

