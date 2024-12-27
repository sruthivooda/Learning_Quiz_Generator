const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://Indra:indra@cluster0.2b7kvoh.mongodb.net/QuizLLM?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Define Schemas
// Contact Schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
});
const Contact = mongoose.model("Contact", contactSchema);

// Question Schema
const questionSchema = new mongoose.Schema({
  topic: String,
  subTopic: String,
  questionType: String,
  numQuestions: Number,
  email: String, // Added email field
  questions: [
    {
      questionType: String,
      question: String,
      options: [String],
      answer: String,
    },
  ],
  sourceType: { type: String, enum: ["pdf", "non-pdf"], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Question = mongoose.model("Quiz", questionSchema);
const Submission = mongoose.model("Cquiz", questionSchema);

// User Schema for Login/Registration
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// API Endpoints
// Register User
app.post("/register", async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).send({ message: "Passwords do not match" });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send({ message: "User already exists" });
  }
  const newUser = new User({ email, password });
  await newUser.save();
  res.status(201).send({ message: "User registered successfully" });
});

// Login User
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).send({ message: "Invalid email or password" });
    }
    res.status(200).send({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error logging in" });
  }
});

// Fetch Maximum Questions
app.get("/getnumques", (req, res) => {
  const { topic, subTopic } = req.query;

  if (!topic || !subTopic) {
    return res.status(400).send({ error: "Topic and Subtopic are required" });
  }

  const command = `python getnumques.py --topic "${topic}" --subTopic "${subTopic}"`;
  console.log("Running command:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing getnumques.py: ${stderr}`);
      return res.status(500).send({ error: "Error fetching max questions" });
    }

    try {
      const result = JSON.parse(stdout);
      res.status(200).send(result);
    } catch (e) {
      console.error("Error parsing Python output:", e);
      res.status(500).send({ error: "Error parsing max questions output" });
    }
  });
});

// Generate Questions
app.post("/api/generate-questions", (req, res) => {
  const { topic, subTopic, questionType, numQuestions, email } = req.body;

  if (!email) {
    return res.status(400).send({ error: "Email is required" });
  }

  const command = `python main1.py --topic "${topic}" --subTopic "${subTopic}" --questionType "${questionType}" --numQuestions ${numQuestions}`;
  console.log("Running command:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing main1.py: ${stderr}`);
      return res.status(500).send({ error: "Error generating questions" });
    }

    try {
      const result = JSON.parse(stdout);

      const newQuestions = new Question({
        topic,
        subTopic,
        questionType,
        numQuestions,
        sourceType: "non-pdf",
        email,
        questions: result.questions.map((q) => ({
          questionType: q.questionType || "Unknown",
          question: q.question || "No question",
          options: q.options || [],
          answer: q.answer || "No answer",
        })),
      });

      newQuestions
        .save()
        .then(() => {
          console.log("Questions saved");
          res.status(200).send(result);
        })
        .catch((err) => {
          console.error("Error saving questions:", err);
          res.status(500).send({ error: "Error saving questions to database" });
        });
    } catch (e) {
      console.error("Error parsing Python output:", e);
      res.status(500).send({ error: "Error parsing generated questions" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});