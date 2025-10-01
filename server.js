const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3005; //My Express server’s port

//middleware 
app.use(cors());
app.use(express.json());

//connect to MongoDB   
mongoose.connect('mongodb://localhost:27017/school') //MongoDB’s port
    .then(() => console.log('MongoDB connected'))
    .catch((error) => console.error('MongoDB connection error:', error));

//Schema and model 
const StudentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    grade: String
});
const Student = mongoose.model('Student', StudentSchema);
// line 13 to 23 setting up the database for how we are gonna use it.


// Samle data initilization
const initilization = async () => {
    try {
        const count = await Student.countDocuments(); //Wait until the database finishes counting documents, then assign that number to count
        if(count === 0){
            const sampleStudents = [
                {name: 'Alice', age: 14, grade: '9th'},
                {name: 'Bob', age: 15, grade: '10th'},
                {name: 'Charlie', age: 13, grade: '8th'}
            ];
            await Student.insertMany(sampleStudents); // waits until students are added before moving on.
            console.log('Sample students added to the database');
        }else{
            console.log('Database already contains student data');
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
};

//initilize sample data after connecting to database
mongoose.connection.once('open', () => {
    initilization();
});


//CRUD Endpoints
//CREATE
app.post('/students', async (req, res)=>{
    try {
        const student = new Student(req.body);
        await student.save();
        res.json({message: 'Student added successfully', studentId: student._id});
    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
});

//READ all students
app.get('/students', async (req, res) => {
    try {
        const students = await Student.find();  // ⬅️ This gets ALL students from MongoDB
        res.json(students);                     // ⬅️ Sends an ARRAY of student objects 
    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
});

//READ BY STUDENT ID 
app.get('/students/:id', async (req, res) => {
    try {

        // we can do this like that too 
        // const { id } = req.params;
        //const student = await Student.findById(id);
        const student = await Student.findById(req.params.id);
        if(!student){
            return res.status(404).json({message: 'Student not found'});
        }
        res.json(student);
    } catch (error) {
        res.status(400).json({message: 'Invalid student ID'});
    }
});


// app.get('/students/name/:name', async (req, res) => {
//     try {
        
//         //const name = req.params.name;
//         //This is equivalent to writing: 
//         const {name} = req.params; // Find all students whose name matches the parameter
//         const students = await Student.find({ name: name });
//         if (students.length === 0) {
//             return res.status(404).json({ message: 'No students found with that name' });
//         }
//         res.json(students);
//     } catch (error) {
//         res.status(400).json({message: 'Invalid name format'});
        
//     }
// });


//update student by ID 
app.put('/students/:id', async (req, res) => {
    try {
      const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.json({ message: 'Student updated successfully', student });
    } catch (error) {
      res.status(400).json({ message: 'Invalid student ID' });
    }
  });

// delete student by ID
app.delete('/students/:id', async (req, res) => { 
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if(!student){
        return res.status(404).json({message: 'Student not found'});
    }
    res.json({message: 'Student deleted successfully'});
    } catch (error) {
        res.status(400).json({message: 'Invalid student ID'});
    }
    
});

//start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});