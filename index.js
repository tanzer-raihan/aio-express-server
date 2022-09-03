const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


//connect mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ahltbit.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//using mongodb
async function run() {
    try {
        const database = client.db("aio-express");
        const allProducts = database.collection("products");

        app.get('/products', async (req, res) => {
            const cursor = allProducts.find({});
            const result = await cursor.toArray();
            res.send(result);

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