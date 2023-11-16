# Jobly - Backend
Jobly is an indeed like application

## Tech Stack
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

## Features
Here is an overview of some of the key features

- 100% test coverage
- Full credentialing is implemented: users can log in, sign up, and update their profiles
- Routes are protected with middleware

## Local setup instructions
Fork and clone this repo
```
cd [path_to_your_cloned_backend]
npm install
npm start
```
the backend will now be running locally on port 3001

Fork and clone the [frontend](https://github.com/camrandev/jobly-frontend) 

```
cd [path_to_your_cloned_frontend]
npm install
npm start
```
the frontend will now be running locally on port 3000


## Tests
- This project has 100% coverage of statements, functions, and lines.
- Branch coverage is at ~95%

to run the tests
```
jest -i (run all tests)
jest -i --coverage (generate a coverage report)
```

## To-Dos
- implement the routes to allow users to apply to jobs
- get to 100% branch coverage
- clean + refactor code as appropriate
- refactor the project to use typescript

## Acknowledgements
The backend of Jobly was built during my time at Rithm School, as part of a 3-day sprint. My partner on the backend was [Ashley Lin](https://github.com/Ashley-Y-Lin)



