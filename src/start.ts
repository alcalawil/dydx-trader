import app from '@server';
import { logger } from '@shared';
import config from './config';
import SQSConsumer from './modules/SQSConsumer';
import sqsRoutes from './sqsRoutes';

// Initialize Server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  logger.info('Express server started on port: ' + port);
});

// SQS
const sqsConsumer = SQSConsumer(config, sqsRoutes);
sqsConsumer.start();
