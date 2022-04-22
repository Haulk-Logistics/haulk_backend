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

- Node.Js
- Express.Js
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




----------------------------------------------------------

## DEPLOYMENT RULES / GUIDELINES

Never push directly to the defualt branches.
- production
- staging
- development

For every change to the codebase, no matter how tiny, create a new branch for it, work on that branch and push to it, then make a pull request from that branch to the development branch.
Staging and Production branches are out of bounds and should never be pushed to or make a pull request against them.

Steps To Create a Pull Request:

- Click on the issue assigned to you, at the left side, you see a create branch text button, click on it, and copy the git command there and run it in the root folder of haulk front end git repository.

- Run 'git push' to publish the branch to the remote (haulk front end repo) repository.

- Work on that branch and do what your issue ticket tells you to do

- Once you are done, create a pull request from that branch to the development branch.

link to video : 

----------------------------------------------------------

## DEVELOPEMENT RULES / GUIDELINES WRITING SERVER CODES

### 01. Comment your code very well

Writing a difficult piece of code where it’s difficult to understand what you are doing and, most of all, why? Never forget to comment it. This will become extremely useful for everyone and to your future self.

### 02. Keep an eye on your file sizes

Files that are has long codes are extremely hard to manage and maintain. Always keep an eye on code length in a file, and if they become too long, try to split them into modules packed in a folder as files that are related together.

### 03. Anything/Everything that is likely to vary between deploys (staging, production, developer environments, etc). Should be added to .ENV. Do not store config as constants in the code. This is a violation of twelve-factor, which requires strict separation of config from code. Config varies substantially across deploys, code does not.

### 04. Naming Convention

When naming a variable, use camelCase. When naming a function, use camelCase. When naming a class, use PascalCase. When naming a module, use PascalCase. lets try to avoid a_b_c naming convention, it makes code harder to read.

----------------------------------------------------------

### Important Links To Docs You MIght Need

- Express Validator :-
<https://express-validator.github.io/docs/index.html>

- Mongoose :-
<https://mongoosejs.com/docs/validation.html>
