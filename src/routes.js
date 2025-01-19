import { Router } from 'express';
import authMiddleware from './app/middlewares/auth';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

const routes = new Router();

// Rotas CRUD de Usuários

routes.post('/users', UserController.store);

// Redefinir senhas
routes.post('/redefinirSenha', UserController.forgotPassword);

routes.post('/reset-password/:token', UserController.resetPassword);

// Fazer login na sessão
routes.post('/sessions', SessionController.store);

// Todas as rotas abaixo usarão o middlewares de authorization

routes.use(authMiddleware);

routes.get('/listarUsers', UserController.index);

routes.put('/update/:id', UserController.update);

routes.delete('/user/:id', UserController.delete);


export default routes;