const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
require('dotenv').config()


//middleware
app.use(express.json())
app.use(cors())

//username:anksuh114
// password:qUfUtnvgVYRoUGzS

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { message } = require('prompt');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@job-portal.rykgkb7.mongodb.net/?retryWrites=true&w=majority&appName=job-portal`;

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

    //create Database
    const db = client.db('mernjobportal');
    const jobcollections = db.collection('demojobs');

    //post a jobs
    app.post('/post-job', async (req, res) => {
      const body = req.body;
      body.createAt = new Date();
      console.log(body)
      const result = await jobcollections.insertOne(body);
      if (result.insertedId) {
        return res.status(200).send(result);
      }
      else {
        return res.status(404).send({
          message: 'cannot insert try again!',
          status: false
        })
      }
    })

    //get all jobs
    app.get('/all-jobs', async (req, res) => {
      const jobs = await jobcollections.find({}).toArray()
      res.send(jobs)
    })


    //get single job for editing using id
    app.get('/all-jobs/:id', async (req, res) => {
      const id = req.params.id;
      const job = await jobcollections.findOne({
        _id: new ObjectId(id)
      })
      res.send(job)
    })

    //get jobs by email from myjobs:-
    app.get('/my-job/:email', async (req, res) => {
      // console.log(req.params.email)
      const jobs = await jobcollections.find({ postedBy: req.params.email }).toArray();
      res.send(jobs)
    })


    //UPDATE A JOBS 
    app.patch('/update-job/:id', async (req, res) => {
      const id=req.params.id
      const jobdata=req.body
      const filter={_id:new ObjectId(id)};
      const options={upsert:true}
      const updatedoc={
        $set:{...jobdata
        }
      }
      const result=await jobcollections.updateOne(filter,updatedoc,options)
      res.send(result)
    })

    //delete a job fromthe my job table
    app.delete('/job/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const result = await jobcollections.deleteOne(filter)
      res.send(result)
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


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})