# VIDEO_TUBE 📺

Welcome to VideoTube, a robust backend project developed with a stack comprised of MongoDB, Express.js, and Node.js, powering a feature-rich platform reminiscent of YouTube. This project boasts a collection of controllers, each meticulously crafted to manage distinct functionalities seamlessly. Explore the inner workings of VideoTube, where cutting-edge technologies converge to deliver a dynamic and engaging user experience. 🚀

## API Documentation

Explore the API endpoints in the [API Documentation](https://documenter.getpostman.com/view/29755499/2s9YyvBgAF)

## Controllers 🎮

### 1. User Controller 👤
#### The User Controller in VideoTube is the backbone for user-centric functionalities, encompassing user registration, authentication, and account settings. It encapsulates essential operations, such as : 
- User registeration
- User login
- User logout
- Get user channel profile
- Get user watch history
- refresh access token
- More

### 2. Video Controller 🎥
#### The Video Controller in VideoTube orchestrates video-related operations, facilitating seamless interactions within the platform. It encompasses functionalities such as: 
- Video publication
- Video deletion
- Video updates
- status toggling
- video watching
- updating video views
- fetching a curated list of videos
- More

### 3. Subscription Controller 📬
#### The Subscription Controller in VideoTube navigates the realm of user connections, allowing users to stay tuned to their favorite channels. Key functionalities include:
- Toggling subscriptions to channels
- Retrieving channels subscribed to by a user
- Fetching subscribers of a specific channel


### 4. Playlist Controller 🎵
#### The Playlist Controller in VideoTube orchestrates the rhythm of user-curated playlists, offering a symphony of functionalities including:
- Playlist creation
- Playlist retrieval by user
- Playlist retrieval by ID
- Playlist deletion
- Playlist updates
- Adding a video to a playlist
- Removing a video from a playlist

### 5. Comment Controller 💬
#### The Comment Controller in VideoTube orchestrates the narrative around video discussions, providing a platform for users to engage. Key functionalities include:
- Retrieving comments for a specific video
- Adding a comment to a video
- Deleting a comment
- Updating an existing comment

### 6. Like Controller 👍
#### The Like Controller in VideoTube orchestrates the symphony of user interactions, capturing the essence of appreciation and endorsement across various content types. Its main functions include:
- Toggling likes for videos, comments, and tweets
- Retrieving videos liked by the user

### 7. Tweet Controller 🐦
#### The Tweet Controller in VideoTube manages the captivating world of micro-content, allowing users to share their thoughts in concise yet impactful tweets. Core functionalities encompass:
- Creating a new tweet
- Retrieving tweets posted by a user
- Updating tweet content
- Deleting a tweet

### 8. Dashboard Controller 📊
#### The Dashboard Controller in VideoTube acts as the central hub for overseeing and managing various aspects of a user's content and channel performance. It provides functionalities including:
- Retrieving a user's uploaded videos.
- Fetching detailed channel statistics, such as subscriber count, video count, likes count, and total views count.
- Offering general channel information for a holistic overview.

### 9. Healthcheck Controller 📊
#### The Healthcheck Controller in VideoTube serves as a vital endpoint to verify the smooth operation of the server. Key features include:
- Verifies the server's normal operation. Responds with a status message indicating the server is running normally.

## Clone the Repository

```
git clone https://github.com/DIVYESH-GITHUB/VIDEO_TUBE.git
```
## Contributing 🤝
We welcome contributions to VideoTube! If you have any ideas, bug fixes, or improvements, feel free to open an issue or create a pull request. We appreciate your contributions.

## Summary
VideoTube is a versatile backend project that facilitates a multitude of features, including user management, video handling, subscriptions, playlists, comments, likes, tweets, and detailed channel analytics. Dive into the codebase to explore each controller's functionalities.



