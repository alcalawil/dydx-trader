import { ISQSRoute } from '@entities';
import orders from './orders';

const sqsRoutes: ISQSRoute[] = [...orders];

export default sqsRoutes;
