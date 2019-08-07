# Terrian - A Spotify Web Application
### Description
Terrian is the first personal project Ive personally taken on. I came about the idea as a way to mix my admiration for music with code. It was a way for me to learn more about Angualr, JavaScript, and web development. 

This web app gives data from Spotify not accessible from Spotify. Allows users to update their playlists and gives access to current playing media in a fun way and with an asethtic touch. 

In the future, I hope to expand upon this project or take on a new project dealing with music.

## src
The src file is the heart of the web application. Each folder holds a TypeScript file and an html file which is routed into the app HTML page when the page is activated. 

Obviously, the app module, component, and html holds shared data. Currently, the header and footer. 

### Welcome

The welcome page is the home page. It has some cool functionality. If there is a song playing through the user's Spotify, it has a pretty cool song playing div. As well, it links to the song page. Otherwise, it has a welcome message.

As well, it has some of the user's playlists.

In the future, I hope to expand the home page to include some more of the user's data. 

### Rankings

The rankings page is my favorite part of the site. It's where the rankings of the user's most listened to artists of the last 4 weeks, 6 months, and all time. 

As well, the same data can be shown for tracks. However, with tracks, the ability to make a playlist of the data that will be updated in the user's spotify accounts is available. 

### Song
The song page has the ability to change and the current song playing along with other data such as play/pause, favorite, turn on or off shuffle, and skip or replay a song. 

As well, the song page layout is pretty cool. The artist photo from Spotify is shown behind the playing data. 

## TODO
- Implement login
- Edit Song page to update access token
- Have access Token avaliable and refresh
- Add more data to welcome


