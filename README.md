# HAULK LOGISTICS SERVER

## COMMANDS

### Start Server On Development Environment :-  

$ npm run dev

### Start Server On Staging Environment  :-

$ npm run staging

### Start Server On Production Environment :-

$ npm run prod

----------------------------------------------------------

## Technologies

- Node Js
- Express Js
- Monogo DataBase (mongoose)

----------------------------------------------------------

## CODE-BASE FOLDER STRUCTURE

### Controllers :- /controller

 Handles the application requests, interact with models and send back the response to the client

### Models :- /model

Database Models

### Routes :- /routes

The goal of the route is to guide the request to the correct handler function

### Services :- /services

### Utils :- /utils

- server.js : Responsible for connecting the MongoDB and starting the server.

- app.js : Configure everything that has to do with Express application.server.js : Responsible for connecting the MongoDB and starting the server.

----------------------------------------------------------

## DEPLOYMENT RULES / GUIDELINES

----------------------------------------------------------

## DEVELOPEMENT RULES / GUIDELINES WRITING SERVER CODES

### 01. Comment your code very well

Writing a difficult piece of code where it’s difficult to understand what you are doing and, most of all, why? Never forget to comment it. This will become extremely useful for everyone and to your future self.

### 02. Keep an eye on your file sizes

Files that are has long codes are extremely hard to manage and maintain. Always keep an eye on code length in a file, and if they become too long, try to split them into modules packed in a folder as files that are related together.

### 03. Anything/Everything that is likely to vary between deploys (staging, production, developer environments, etc). Should be added to .ENV. Do not store config as constants in the code. This is a violation of twelve-factor, which requires strict separation of config from code. Config varies substantially across deploys, code does not

----------------------------------------------------------

### Important Links To Docs You MIght Need

- Express Validator :-
<https://express-validator.github.io/docs/index.html>

- Mongoose :-
<https://mongoosejs.com/docs/validation.html>
