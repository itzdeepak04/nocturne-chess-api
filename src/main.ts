import { bootstrap } from './bootstrap';
void bootstrap().then(app => app.listen(process.env.PORT ?? 3000));
