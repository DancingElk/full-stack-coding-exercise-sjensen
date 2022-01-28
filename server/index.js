const express = require('express')
const app = express()
const port = 3011;

app.get('/api/', (req, res) => {
  res.send({"success": true, data: "Hello World!"})
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
