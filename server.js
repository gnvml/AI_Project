// server.js
const express = require('express')
const server = express()
const resize = require('./resize')

server.get('/', (req, res) => {
  const widthStr = 640
  const heightStr = 480
  const format = 'jpeg'
  let width, height
  if (widthStr) {
    width = parseInt(widthStr)
  }
  if (heightStr) {
    height = parseInt(heightStr)
  }
  res.type(`image/${ format || 'png' }`)
  resize('download.png', format, width, height).pipe(res)
})

server.listen(3000, () => {
    console.log('Server is running on port 3000!')
})