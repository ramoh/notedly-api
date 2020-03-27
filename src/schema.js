const {gql} = require("apollo-server-express");


module.exports = gql`
    scalar DateTime
    type Note {
        id: ID
        content: String
        author: User
        createdAt: DateTime
        updatedAt: DateTime
        favoriteCount: Int!
        favoritedBy: [User!]
    }

    type NoteFeed {
        notes: [Note]!
        cursor: String!
        hasNextPage: Boolean!
    }

    type User {
        id: ID
        username: String
        email: String
        avatar: String
        notes: [Note]
        favorites: [Note!]!
    }

    type Query {
        hello: String
        notes: [Note]
        note(id: ID): Note
        user(username: String!): User
        users: [User !]!
        me: User !
        # add a note Feed to out existing query
        noteFeed(cursor: String): NoteFeed
    }

    type Mutation {
        newNote(content: String!): Note
        updateNote(id: ID!,content: String!) : Note !
        deleteNote(id: ID!): Boolean!
        signUp(username: String!,email: String!,password: String!): String!
        signIn(username: String,email: String,password: String!): String!
        toggleFavorite(id: ID!) : Note!
    }
`;