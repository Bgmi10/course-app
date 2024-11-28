import express from "express";
//@ts-ignore
import { prisma } from "../../prisma/prisma";

const Course = express.Router();

Course.get('/course/all', async (req : express.Request, res : express.Response) => {
    try { 
       const courses =  await prisma.course.findMany({});
        res.status(200).json({courses});
    }
    catch(e){
        console.log(e);
        res.status(500).json({message : 'internal server'});
    }
});

Course.get('/course/:id', async (req : express.Request, res : express.Response) => {

    const {id} = req.params;
    
    if(!id){
      res.status(400).json({ message : "id is required" });
      return;
    }

    try {
        const course = await prisma.course.findUnique({
            where : {id : parseInt(id)}
        })

        if(!course){
            res.status(404).json({ message : "course not found" });
            return;
        }

        res.status(200).json({ message : course });
    }
    catch(e){
        console.log(e);
        res.status(500).json({ message : "internal server error" });
    }

});


Course.post('/course' , async(req : express.Request, res : express.Response) => {
    const { title, description, price, instructorId, categoryId } = req.body;

    if(!title || !description || !price ||  !instructorId || !categoryId){
        res.status(400).json({ message : "All fields are required" });
        return;
    }
    
    try {
        await prisma.course.create({
            data : {
                title,
                description,
                price,
                instructorId,
                categoryId
            }
        })

        res.status(200).json({ message : "course created successfully" });
    }
    catch(e){
        console.log(e);
        res.status(500).json({ message : "internal server error" });
    }

});


export default Course