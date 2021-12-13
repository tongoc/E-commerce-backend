import gql from 'graphql-tag';

export default gql`
  type Query {
    hello: String
    me: User
    products: ProductList
  }

  type Mutation {
    addProduct(item: createProductInput!): Product
    subcrible: String
    purchaseProduct(id: ID!): Int
  }

  type Message {
      content: String
  }

  type Subscription {
    notification: Message
  }

  type Product {
    name: String
    detail: String
    fee: Int
    id: Int
  }

  type ProductList {
    items: [Product]
    total: Int
  }

  type User {
    name: String
    facebookId: String
    purchasedProducts: ProductList
  }

  input createProductInput {
    name: String!
    detail: String!
    fee: Int
  }
`;
