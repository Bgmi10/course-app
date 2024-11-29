export default function Courses () {
    return (
        <div>
            
        </div>
    )
}

// model Course {
//     id          Int          @id @default(autoincrement())
//     title       String  
//     description String  
//     price       Float  
//     instructor  User         @relation("CourseInstructor", fields: [instructorId], references: [id])
//     instructorId Int  
//     lessons     Lesson[]
//     category    Category     @relation(fields: [categoryId], references: [id])
//     categoryId  Int
//     enrollments Enrollment[]
//     reviews     Review[]
//     createdAt   DateTime     @default(now())
//     updatedAt   DateTime     @updatedAt
  
//     Progress Progress[]
//   }