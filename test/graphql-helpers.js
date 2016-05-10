import {graphql, GraphQLSchema, GraphQLObjectType} from 'graphql'

export function runGraphQLQuery(graphqlQueryString, fields, rootQuery = {currentUser: true}) {
  const query = new GraphQLObjectType({name: 'Query', fields})
  const schema = new GraphQLSchema({query})

  return graphql(schema, graphqlQueryString, rootQuery)
}
