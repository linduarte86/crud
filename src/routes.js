import { Router } from 'express';
import UserController from './app/controllers/UserController';

const routes = new Router();

// Rotas Usuários

routes.post('/users', UserController.store);

routes.get('/listarUsers', UserController.index);

routes.put('/update/:id', UserController.update);

routes.delete('/user/:id', UserController.delete);


export default routes;