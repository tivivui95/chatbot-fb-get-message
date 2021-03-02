# Auto log message from facebook page
This is a server which is getting message from Facebook Page Messenger for labeling and predicting emotion from Vietnamese text messages using NodeJs, ExpressJs, Flask backend and Pug NodeJs with Bootstrap for frontend.
## How to use
Install NodeJs and other lib requirements
```
npm install
```
Using ```npm start``` to start your server locally in port 1337, you can change your port in *index.js*
```
npm start
```
## How to connect to Facebook Page
- Create a Facebook Dev Account
- Create an app 
- In Product, add Messenger
- Change Callback URL to your URL like this: `yoururl.com/webhook'
- In Verify Token, type `verify`, you can change this variable in _index.js_
- Add page and data access to your app

## Connect to Flask server
This code is setup to connect with our Flask API for Emotion classification model for Vietnamese, you can change URL to your API in `axios` function in _index.js_

## Data locate
We are using PSID and json file to temporarily save messages from user, you can export data from `webhook-event` to save file

## Frontend
We are using Pug for Nodejs and Bootstrap 4 for our front-end webpage, full document can be found on their official website.
