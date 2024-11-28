import express from 'express';
import { prisma } from '../../prisma/prisma';

const Lessons = express.Router();


Lessons.get('/course/:courseId/lessons', async (req, res) => {

    const {id} : any = req.params;

    if(!id){
        res.status(400).json({ message : "id required in order to access lessons"});
        return;
    }

    try {
        const courseLessons = await prisma.lesson.findMany({
            where : {
                courseId : parseInt(id)
            }
        });
        
        if(!courseLessons){
            res.status(400).json({ message : "lesson not found or available" });
            return;
        }

        res.status(200).json({ message : courseLessons });
    }
    catch(e){
        console.log(e);
        res.status(500).json({ message : "internal server error" });
    }
});

Lessons.post('/course/:courseId/lessons', async (req,res) => {
    const { courseId } = req.params;
    const { title, videourl, content, order } = req.body;

    if(!courseId){
        res.status(400).json({ message : "courseid is required"});
        return;
    }
    
    if(!title || !videourl || !content || !order){
        res.status(400).json({ message : "All fields are required title, videourl, content, order" });
        return;
    }
    
    try {
        await prisma.lesson.create({
            data : {
                title,
                videoUrl : videourl,
                content,
                order,
                courseId : parseInt(courseId)
            }
        })

        res.status(200).json({ message : "lessons created" });
    }
    catch(e){
        console.log(e);
        res.status(500).json({ message : "internal server error" });
    }
});


export default Lessons;