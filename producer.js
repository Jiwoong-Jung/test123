const amqp = require('amqplib');

async function send() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'hello';

    await channel.assertQueue(queue, { durable: true });
    const message = 'Hello, RabbitMQ!';

    channel.sendToQueue(queue, Buffer.from(message));
    console.log(`Sent: ${message}`);

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error(error);
  }
}

send();
