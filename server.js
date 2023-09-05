require('dotenv').config();
const {  Kafka } = require('kafkajs')
const express = require('express');
const {Worker, workerData}=require('node:worker_threads');
const validator=require('./validations.js');
const kafkaConfig=require('./src/Config/kafka_server.json')
const app = express();

const gKafka = new Kafka(kafkaConfig);
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

  if(!validator.validateSchemaLogic(req.body,validator.bValidSchema)){
       res.status(400).send("Invalid Schema")
  }
  else{
      next()
  }
})
  
// producer api
app.post('/api/produce/:topic',async (req,res)=>{
  let topic=req.params.topic
  let message=req.body.message.key1
  await gProducer.send({
      topic: topic,
      messages:[{ value:message}]
  })
  console.log(`sended topic : ${topic}, message :${message}`);
  res.status(200).send("Message sent");
})

app.listen(process.env.PORT, [process.env.HOST], ()=>
{
    console.log(`Server running at http://${process.env.HOST}:${process.env.PORT}/`);
})


start().catch(console.error)
