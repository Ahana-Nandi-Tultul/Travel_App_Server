const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`Travily is traveling.`);
})

const verifyJwt = (req, res, next) => {
    const authorization = req.headers.authorization;
    if(!authorization){
      return res.status(401).send({error: {status: true, message: 'unauthorized access'}});
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decode) => {
      if(error){
        return res.status(401).send({error: {status: true, message: 'unauthorized access'}});
      }
      req.decode = decode;
      next();
    })
  }

app.post('/jwt', (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1hr'})
    res.send({token})
});


const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://travily:YYBdYKfYz9sLoWoT@cluster0.epxwefd.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.epxwefd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db('travily').collection('users');

    app.post("/users", async(req, res) => {
        const newUser = req.body;
        const email = newUser?.email;
        const filter = {email: email};
        const existUser = await usersCollection.findOne(filter);
        if(existUser){
          return res.send({});
        }
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, ()=>{
    console.log(`Travily is listeing on port:${port}`);
})

