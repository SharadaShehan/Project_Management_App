import { pubSub } from '../utils.js'
import { User } from '../models/index.js'

export default {
  Subscription: {
    newMessage: {
      subscribe: async (root, args, context, info) => {
        const user = await User.findOne({ wsToken: args.wsToken })
        if (!user) {
          throw new Error('Invalid user')
        }
        return pubSub.asyncIterator([user.id.toString()])
      }
    }
  }
}
