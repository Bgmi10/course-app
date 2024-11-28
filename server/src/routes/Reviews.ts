import express from 'express';
import { prisma } from '../../prisma/prisma';


const Reviews = express.Router();

Reviews.post('/review', async(req, res) => {
      
    const { rating, comment, userId, courseId } = req.body;

    if(!rating || !comment || !userId || !courseId){
        res.status(400).json({ message : "all fields are required" });
        return;
    }

    try {
         await prisma.review.create({
            data : {
                rating,
                courseId,
                userId,
                comment
            }
        })

        res.status(200).json({ message : "posted sucessfully" });
    }

    catch(e){
        console.log(e);
        res.status(500).json({ message : "internal server error" });
    }
});

export default Reviews;