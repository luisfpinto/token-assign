const express = require('express')
const helmet = require('helmet') // Security pack
const RateLimit = require('express-rate-limit') // Limit number of requests
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const app = express()
const limiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  delayMs: 0 // disable delaying - full speed until the max limit is reached
})
const { PORT, DATABASE_URL, TOKEN_LENGHT } = require('./config.js')
const { Token, User } = require('./models.js')

mongoose.Promise = global.Promise

app.use(helmet())
app.use(limiter)
app.use(bodyParser.json())

app.listen(PORT || 8080, () => {
  console.log(`Your app is listening on port ${PORT || 8080}`)
  mongoose.connect(DATABASE_URL, err => {
    if (err) console.error(err)
  })
})

app.get('/getPin', (req, res) => {
  Token
    .create({quantity: 1})
    .then(token => {
      Token
      .findByIdAndUpdate(token.id, {
        tokenId: token.id.substr(token.id.length - TOKEN_LENGHT)}, {new: true}) // Include TokenId 6 length
      .then(tokenUpdated => {
        res.status(200).json({message: tokenUpdated})
      })
    })
    .catch(err => {
      res.status(500).json({message: err})
    })
})

app.post('/validateUser', (req, res) => {
  const {userId, tokenId} = req.body
  Token
  .find({tokenId})
  .then(token => {
    if (token[0].quantity > 0) {
      Token
      .findByIdAndUpdate(token[0].id, {quantity: (token[0].quantity - 1)})
      User.create({tokenId, userId, validated: true})
      .then(() => {
        res.status(200).json({message: 'User created and validated'})
      })
    } else throw({ msg: 'Invalid Token' })
  })
  .catch(err => {
    res.status(500).json({msg: err.msg})
  })
})

app.post('/checkUser', (req, res) => {
  const {userId} = req.body
  User
  .find({userId})
  .then(user => {
    console.log(user)
    if (user[0] && (user[0].validated === true)) res.status(200).json(user[0])
    res.status(200).json({message: 'User not validated'})
  })
  .catch(err => {
    res.status(500).json({message: err})
  })
})

app.use((req, res) => {
  res.status(403).send({message: 'Forbidden access'})
})
