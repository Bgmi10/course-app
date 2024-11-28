import express from "express";
import { prisma } from "../../prisma/prisma";

const Enrollments = express.Router();

Enrollments.post('/enrollments', async (req, res) => {
    const { userId, courseId } = req.body;
    
    if(!userId || !courseId){
        res.status(400).json({ message : "userId, courseId required" });
        return;   
    }

    try{
        const newenrollments = await prisma.enrollment.create({
            data : {
                userId,
                courseId
            }
        })
        res.status(200).json({ message : "enrolled successfully", newenrollments });
    }
    catch(e){
        console.log(e);
        res.status(500).json({ message : "internal server error" });
    }
});

Enrollments.get('/users/:userId/enrollments', async (req, res) => {
      
    const { userId } = req.params;

    try {
        const userenrollments = await prisma.enrollment.findMany({
            where : { userId : parseInt(userId) },
            include : { course : true }
        })
        
        if(!userenrollments){
            res.status(404).json({ message : "enrollments are not found or available" });
            return;
        }

        res.status(200).json({ message : userenrollments });
    }
    catch(e){{
        console.log(e);
        res.status(500).json({ message : "internal server error" });
    }}
});

export default Enrollments
