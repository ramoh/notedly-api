const express = require("express");
const {ApolloServer} = require("apollo-server-express");
require("dotenv").config();

const db = require("./db");
const models = require("./models");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const cors = require("cors");
const depthLimit = require("graphql-depth-limit");
const {createComplexityLimitRule} = require("graphql-validation-complexity");

// Run our server on a port specified in our .env file or port 4000
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

//Instantiate app
const app = express();

//helmet middleware should be at the top of the stack
app.use(helmet());
//cors middleware
app.use(cors());

db.connect(DB_HOST);

//get the user info from the JWT
const getUser = token => {
    if (token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);

        } catch (err) {
            //if there is an problem with session throw an error
            throw new Error("Invalid session");
        }
    }
};

// Apollo Server setup
const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
    context: ({req}) => {
        //get the user token from the header
        const token = req.headers.authorization;
        //try to retrieve a user with the token 
        const user = getUser(token);
        //for now lets log the user to the console 
        console.log(user);
        //add the db models to the context
        return {models, user};
    }
});

// Apply the Apollo GraphQL middleware and set the path to /api
server.applyMiddleware({app, path: "/api"});

app.listen({port}, () =>
    console.log(
        `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
    )
);