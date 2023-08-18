require('dotenv').config();
const {  Kafka } = require('kafkajs')
const express = require('express');
const {Worker, workerData}=require('node:worker_threads');
const validator=require('./Validations.js');

const app = express();

const gKafka = new Kafka({
  clientId: 'app', 
  brokers: ['localhost:9092']
});
const gProducer = gKafka.producer(); 

// main function 
const start = async () => {
    await gProducer.connect();
};

// consumer api
app.get('/api/consume/:topic',async (req,res)=>{
const worker  =new Worker('./KafkaConsumerWorker.js',{workerData:{topic:req.params.topic}})
res.status(200).send("")
});

app.use(express.json());

//middleware for json validation
app.use((err,req,res,next)=>{
  if(err instanceof SyntaxError && err.status === 400 && 'body' in err){
    console.error(err.message);
    return res.status(400).send({message:"Invalid Json"});
  }
  next()
})
// middleware for schema validation
app.use((req,res,next)=>{
  console.log("This is a middleware for schema validation");

  if(!validator.validateSchemaLogic(req.body,validator.bValidSchema))
  {
       res.status(400).send("Invalid Schema")
  }
  else
  {
      next()
  }})
  
// producer api
  app.post('/api/produce/:topic',async (req,res)=>
  {
  await gProducer.send({
      topic: req.params.topic,
      messages:[{ value:req.body.message.key1}]
  });
  console.log(`sended topic : ${req.params.topic}, message :${req.body.message.key1}`);
  res.status(200).send("Message sent");
});

app.listen(process.env.PORT, [process.env.HOST], ()=>
{
    console.log(`Server running at http://${process.env.HOST}:${process.env.PORT}/`);
});


start().catch(console.error);
