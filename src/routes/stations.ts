import Router from 'express'
import { stationController } from '../controllers/stations'

export const stationsRouter = Router()

stationsRouter.get('/', stationController.getStations)
stationsRouter.post('/', stationController.addNewStation)
stationsRouter.delete('/', stationController.deleteStations)
