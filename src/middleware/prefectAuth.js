import { defaultOptions, apolloOnLogin } from '@/vue-apollo'
import { createApolloClient } from 'vue-cli-plugin-apollo/graphql-client'

const apolloClient = createApolloClient({ ...defaultOptions }).apolloClient

const prefectAuth = async (idToken) => {
  try {
    const result = await apolloClient.mutate({
      mutation: require('@/graphql/login.gql'),
      variables: {
        idToken: { idToken: idToken }
      },
      errorPolicy: 'all'
    })
    if (result?.data?.login) {
      await apolloOnLogin(apolloClient)
      return result.data.login
    } else if (result.errors) {
      if (
        result.errors[0].message ===
          "We get it, you're reeaally interested. Unfortunately, the timing isn't quite Prefect yet." ||
        result.errors[0].message ===
          'Thank you for your interest in Prefect Cloud! You have been added to our waitlist.'
      ) {
        return null
      } else {
        throw new Error('No authorization token returned')
      }
    }
  } catch (error) {
    throw new Error(error)
  }
}

const prefectRefresh = async (accessToken) => {
  try {
    const result = await apolloClient.mutate({
      mutation: require('@/graphql/refresh-token.gql'),
      variables: {
        accessToken: accessToken
      }
    })
    if (result?.data?.refresh_token) {
      return result.data.refresh_token
    } else if (result.error) {
      throw new Error(result.error)
    } else {
      throw new Error('No token returned')
    }
  } catch (error) {
    throw new Error(error.error)
  }
}

const prefectUser = async () => {
  try {
    const user = await apolloClient.query({
      query: require('@/graphql/User/user.gql'),
      fetchPolicy: 'no-cache'
    })
    return user.data.user[0]
  } catch (error) {
    throw new Error(error.error)
  }
}

export { prefectAuth, prefectRefresh, prefectUser }
