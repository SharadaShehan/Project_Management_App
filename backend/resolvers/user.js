export default {
  Query: {
    me: async (root, args, { req }, info) => {
      return await 'me'
    }
  }
}
