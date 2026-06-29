export const seedData = {
  users: [
    { id: "p1", name: "Mrs. Rao", role: "principal", username: "principal", password: "demo123" },
    { id: "t1", name: "Mr. Iyer", role: "teacher", username: "teacher1", password: "demo123" },
    { id: "t2", name: "Ms. Fernandes", role: "teacher", username: "teacher2", password: "demo123" },
    { id: "s1", name: "Aarav", role: "student", username: "student1", password: "demo123", teacherId: "t1" },
    { id: "s2", name: "Diya", role: "student", username: "student2", password: "demo123", teacherId: "t1" },
    { id: "s3", name: "Kabir", role: "student", username: "student3", password: "demo123", teacherId: "t1" },
    { id: "s4", name: "Meera", role: "student", username: "student4", password: "demo123", teacherId: "t2" },
    { id: "s5", name: "Rohan", role: "student", username: "student5", password: "demo123", teacherId: "t2" },
    { id: "s6", name: "Zara", role: "student", username: "student6", password: "demo123", teacherId: "t2" }
  ],
  project: {
    id: "proj1",
    title: "Invent Your Own Number System",
    subject: "Computational Thinking (CBSE Class 8 CT & AI curriculum)",
    drivingQuestion: "If you could design a counting system from scratch, how would you make it work — and how would you teach someone else to use it?",
    milestones: [
      { 
        id: "m1", 
        title: "Research existing number systems", 
        instructions: "Briefly describe how 2 number systems (e.g., binary, Roman, Egyptian) represent numbers, and what base each uses.", 
        maxMarks: 15 
      },
      { 
        id: "m2", 
        title: "Design your own base system", 
        instructions: "Choose a base (not 2, 3, or 10). List your digit symbols (0 to base−1) and explain why you chose that base.", 
        maxMarks: 20 
      },
      { 
        id: "m3", 
        title: "Build a model", 
        instructions: "Describe (in words, or attach a photo description) how you'd represent place values physically — e.g., using blocks, sticks, or a drawing, similar to the 'pipes' idea for binary/ternary.", 
        maxMarks: 20 
      },
      { 
        id: "m4", 
        title: "Write & test a conversion algorithm", 
        instructions: "Write step-by-step rules to convert a decimal number into your system, and back. Show the conversion worked out for 2 example numbers.", 
        maxMarks: 25 
      },
      { 
        id: "m5", 
        title: "Apply it + present", 
        instructions: "Use your system for one real purpose (e.g., a secret code, a measuring chart) and explain it in 3–4 sentences.", 
        maxMarks: 20 
      }
    ]
  },
  submissions: [
    {
      studentId: "s1",
      milestoneId: "m1",
      response: "Binary uses base 2 with digits 0-1. Roman numerals are base-less but use key letters like I, V, X, L, C, D, M. Egyptian number system uses a simple grouping base-10 system with distinct hieroglyphic symbols.",
      status: "graded",
      marks: 13,
      feedback: "Good explanation of the three systems, missing a detailed description of base properties."
    },
    {
      studentId: "s1",
      milestoneId: "m2",
      response: "I chose base 4. The symbols are 0, 1, 2, and 3. I chose this base because it fits with computer data logic of binary combinations (each base-4 digit is 2 bits).",
      status: "graded",
      marks: 18,
      feedback: "Well reasoned choice and correct symbol listing."
    },
    {
      studentId: "s1",
      milestoneId: "m3",
      response: "For my base-4 model, I will use four color-coded bowls to represent place values (4^0, 4^1, 4^2, 4^3). Each bowl can hold up to 3 beads of matching colors.",
      status: "submitted",
      marks: null,
      feedback: null
    },
    {
      studentId: "s2",
      milestoneId: "m1",
      response: "Binary is base 2 (0 and 1) and Roman numerals are base-less using additive letters. I also researched Egyptian math which uses tally marks for base 10.",
      status: "submitted",
      marks: null,
      feedback: null
    },
    {
      studentId: "s4",
      milestoneId: "m1",
      response: "Binary (base 2) uses 0 and 1. Octal (base 8) uses 0-7. I researched how different base systems represent values efficiently.",
      status: "graded",
      marks: 14,
      feedback: "Very good. Precise base properties defined."
    },
    {
      studentId: "s4",
      milestoneId: "m2",
      response: "I chose base 5. The symbols are 0, 1, 2, 3, 4 (using letters A, B, C, D, E representing them). I chose base 5 because humans have 5 fingers on one hand.",
      status: "graded",
      marks: 19,
      feedback: "Creative choice of digit symbols and good justification!"
    },
    {
      studentId: "s4",
      milestoneId: "m3",
      response: "I will build a physical abacus with 5 columns. Each column will have 4 rings to represent digit counts.",
      status: "graded",
      marks: 17,
      feedback: "Excellent design for a place-value abacus."
    },
    {
      studentId: "s4",
      milestoneId: "m4",
      response: "To convert base 10 to base 5, divide by 5 repeatedly and collect remainders. For example, 13 in base 10 is 23 in base 5 (which is CD in my system). 26 in base 10 is 101 in base 5 (which is BAB in my system).",
      status: "graded",
      marks: 23,
      feedback: "Algorithm works perfectly and conversions are correct."
    },
    {
      studentId: "s4",
      milestoneId: "m5",
      response: "I will use this system as a secret code to send private messages to my friends. Since each word corresponds to digit codes, we can encrypt messages by shifting letters.",
      status: "submitted",
      marks: null,
      feedback: null
    },
    {
      studentId: "s5",
      milestoneId: "m1",
      response: "I compared Binary (base 2) and Decimal (base 10). Binary is used by computers, and decimal is used by humans.",
      status: "graded",
      marks: 11,
      feedback: "A bit brief. Try to explore another system like Roman or Egyptian."
    },
    {
      studentId: "s5",
      milestoneId: "m2",
      response: "I chose base 12. Digit symbols are 0-9 plus A (10) and B (11). Base 12 is highly divisible by 2, 3, 4, and 6.",
      status: "submitted",
      marks: null,
      feedback: null
    }
  ]
};
