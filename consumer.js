const amqp = require('amqplib');

async function receive() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'hello';

    await channel.assertQueue(queue, { durable: true });
    console.log(`Waiting for messages. To exit, press CTRL+C`);

    channel.consume(queue, (message) => {
      if (message) {
        console.log(`Received: ${message.content.toString()}`);
        channel.ack(message);
      }
    }, { noAck: false });
  } catch (error) {
    console.error(error);
  }
}

receive();
