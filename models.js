const mongoose = require('mongoose')

const tokenModel = mongoose.Schema({
  tokenId: {type: String, required: false},
  quantity: {type: Number, required: true}
})

const userModel = mongoose.Schema({
  tokenId: {type: String, required: true},
  userId: {type: String, required: true},
  validated: {type: Boolean, required: true}
})

const Token = mongoose.model('Token', tokenModel)
const User = mongoose.model('User', userModel)

module.exports = {Token, User}
