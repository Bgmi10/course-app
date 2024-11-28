import express from 'express';
//@ts-ignore
import Course from './routes/Course';
import Enrollments from './routes/Enrollments';
import Lessons from './routes/Lessons';
import Progress from './routes/Progress';
import Reviews from './routes/Reviews';

const app = express();

app.use(express.json());

const PORT = process.env.PORT as string;

const apiroute = '/api/v1';

app.use(apiroute, Course);
app.use(apiroute, Enrollments);
app.use(apiroute, Lessons);
app.use(apiroute, Progress);
app.use(apiroute, Reviews);

app.listen(PORT, () => {
    console.log(`port running on port ${PORT}`)
});