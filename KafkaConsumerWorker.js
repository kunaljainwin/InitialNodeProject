const {workerData}=require('worker_threads')
const {  Kafka } = require('kafkajs')
const mysql = require('mysql2');
const mysqlConfig=require('./src/Config/sql_server.json')

console.log("Worker started");
const gKafka=new Kafka({
  clientId: 'app',
  brokers: ['localhost:9092']
})
// connection pool
const connection=mysql.createConnection(mysqlConfig)
// Connection pool query

const gConsumer=gKafka.consumer( { groupId: 'test-group' } )

const start=async()=>{
  await gConsumer.connect()
  await gConsumer.subscribe({topic:workerData.topic,fromBeginning:true})
  gConsumer.run({
    eachMessage:async(data)=>
    {
      console.log("Message recieved :",data.message.value.toString())
      // Define the time zone offset for UTC+05:30
      const timeZoneOffset = 5.5 * 60 * 60 * 1000;
      let kafkaTimestamp=new Date(Number(data.message.timestamp)+timeZoneOffset).toISOString()
      .replace('T',' ').replace('Z','')
      .substring(0, 19)
      let object=
      {
        topic:data.topic,
        message:data.message.value.toString(),
        timestamp:kafkaTimestamp.toString()
      };
    
      connection.query( 
        `CALL InsertMessage('${object.topic}','${object.message}','${object.timestamp}')`,
            (error, results, fields) => 
            {
            if (error) throw error;
            }
        )
        console.log("Message added into DB")
    }
  })
}

start().catch(console.error)