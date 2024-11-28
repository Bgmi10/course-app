import express from 'express';
import { prisma } from '../../prisma/prisma';


const Progress = express.Router();

Progress.post('/progress', async (req, res) => {

     const { userId, courseId, lessonId, completed, completedAt } = req.body;
     
     if(!userId || !courseId || !lessonId || !completed || !completedAt ){
        res.status(400).json({ message : "All fields are requried" });
        return; 
     }

     try {
        await prisma.progress.create({ 
            data : {
                userId,
                courseId,
                lessonId,
                completed,
                completedAt
            }
        });

        res.status(200).json({ message : "progress saved" });
     }
     catch(e){
        console.log(e);
        res.status(500).json({ message : "internal server error" });
     }
    
});

Progress.get('/users/:userId/courses/:courseId/progress', async (req, res) => {

    const { userId, courseId } = req.params;

    if(!userId || !courseId){
        res.status(400).json({ message : "userId, courseId required" });
        return;
    }
     
    try {
        const progressdata = await prisma.progress.findMany({
            where : {
                userId : parseInt(userId),
                courseId : parseInt(courseId)
            }, 
            include : { lesson: true }
        });

        if(!progressdata){
            res.status(400).json({ message : "progress not found or provide" });
            return;
        }
        
        res.status(200).json({ message : progressdata });
    }
    catch(e){
        console.log(e);
        res.status(500).json({ message : "internal server error" });
    }

});

export default Progress;