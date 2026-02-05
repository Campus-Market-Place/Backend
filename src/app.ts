import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { config } from './config.js';
import { requestLogger } from './middleware/loggemiddleware.js';
import { authRouter } from './router/auth.router.js';
import { sellerRouter } from './router/seller.router.js';
import { adminRouter } from './router/admin.router.js';
import { userRouter } from './router/user.router.js';
import { openApiSpec } from './docs/openapi.js';
import { errorHandler } from './errors/apperror.js';



export const app = express();





if (config.isdev) {
  app.use(cors({
    origin: (origin, cb) => cb(null, true), // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }));
} else {
  // production CORS settings
  //   app.use(cors({
  //   origin: ["https://teff-store.com"], // only your deployed frontend
  //   credentials: true,
  // }));Nn
}



app.use(helmet());
app.use(cookieParser());

app.use(requestLogger);

app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use('/auth', authRouter);
app.use('/', userRouter);
app.use('/', sellerRouter);
app.use('/admin', adminRouter);


app.use(errorHandler);



