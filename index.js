const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
var admin = require("firebase-admin");

var serviceAccount = require("./aio-express-firebase-adminsdk-b3w6l-4392252f16.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


//connect mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ahltbit.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function verifyIdToken(req, res, next) {
    if (req?.headers?.authorization?.startsWith('bearer ')) {
        const idToken = req?.headers?.authorization?.split(' ')[1];
        try {
            const decodedUser = await admin.auth().verifyIdToken(idToken);
            req.decodedUserEmail = decodedUser.email;
        }
        catch {

        }
    }
    next();
}

//using mongodb
async function run() {
    try {
        const database = client.db("aio-express");
        const allProducts = database.collection("products");
        const carts = database.collection('carts');

        app.get('/products', async (req, res) => {
            const cursor = allProducts.find({});
            const result = await cursor.toArray();
            res.send(result);

        })
        app.post('/cart', async (req, res) => {
            const addedProduct = req.body;
            const result = await carts.insertOne(addedProduct);
            res.json(result);


        })
        app.get('/cart', verifyIdToken, async (req, res) => {
            const userEmail = req.query.user;
            if (req.decodedUserEmail === userEmail) {
                const query = { customer: userEmail };
                const cursor = carts.find(query)
                const result = await cursor.toArray();
                res.send(result)

            }
            else {
                res.json([])
            }



        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Getting started with aio backend');

})
app.listen(port, () => {
    console.log('Listening to port', port);
})