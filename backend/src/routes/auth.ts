import { Router } from 'express';
import { loginHandler, logoutHandler, statusHandler } from '../middleware/auth.js';

const authRouter = Router();

authRouter.post('/login', loginHandler);
authRouter.post('/logout', logoutHandler);
authRouter.get('/status', statusHandler);

export default authRouter;
