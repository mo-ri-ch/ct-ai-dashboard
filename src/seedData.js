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
    title: "Build a Secret Message Encoder",
    subject: "Computational Thinking (CBSE Class 8 CT & AI curriculum)",
    drivingQuestion: "If you had to send a secret message that only your friend could read, how would you design the rules — and could someone else crack it?",
    milestones: [
      {
        id: "m1",
        title: "Understand the pattern",
        instructions: "Manually shift every letter of the word HELLO by 3 positions (A→D, B→E, C→F, and so on). Write out the encoded word letter by letter and explain the rule you used in your own words.",
        maxMarks: 15
      },
      {
        id: "m2",
        title: "Write the encode algorithm",
        instructions: "Write a step-by-step algorithm (like a recipe) that anyone could follow to encode any word using a secret key number. Your algorithm must have at least 4 clear numbered steps and handle what happens when the shift goes past Z.",
        maxMarks: 20
      },
      {
        id: "m3",
        title: "Test your encoder",
        instructions: "Apply your encode algorithm to 3 different words using key = 5. Show each letter's transformation one by one. Example format: CAT with key 5 → C(2)+5=7=H, A(0)+5=5=F, T(19)+5=24=Y → HFY.",
        maxMarks: 20
      },
      {
        id: "m4",
        title: "Write the decode algorithm",
        instructions: "Now reverse it. Write the step-by-step rules to decode an encoded message when you know the key. Then test it: decode the message MJQQT using key 5. Show each letter's reverse transformation and state the original word.",
        maxMarks: 25
      },
      {
        id: "m5",
        title: "Crack a cipher without the key",
        instructions: "You have intercepted this encoded message: KHOOR. You do NOT know the key. Describe your strategy for finding the key, then try all shift values from 1 to 25 until you find a real English word. State the key you found and the decoded message.",
        maxMarks: 20
      }
    ]
  },
  submissions: [
    {
      studentId: "s1",
      milestoneId: "m1",
      response: "I shifted each letter of HELLO by 3 positions forward in the alphabet. H→K, E→H, L→O, L→O, O→R. So HELLO becomes KHOOR. The rule is: move each letter 3 steps forward. If you go past Z, wrap back to A.",
      status: "graded",
      marks: 14,
      feedback: "Excellent! Clear letter-by-letter breakdown and correctly identified the wrap-around rule."
    },
    {
      studentId: "s1",
      milestoneId: "m2",
      response: "Step 1: Write down the alphabet and number each letter A=0, B=1, ... Z=25. Step 2: For each letter in the message, find its number. Step 3: Add the key number to it. Step 4: If the result is more than 25, subtract 26 (wrap around). Step 5: The new number gives you the encoded letter. Repeat for every letter.",
      status: "graded",
      marks: 18,
      feedback: "Well structured algorithm. Good handling of the wrap-around with subtraction. Could mention what to do with spaces or punctuation."
    },
    {
      studentId: "s1",
      milestoneId: "m3",
      response: "Using key 5: DOG → D(3)+5=8=I, O(14)+5=19=T, G(6)+5=11=L → ITL. CAT → C(2)+5=7=H, A(0)+5=5=F, T(19)+5=24=Y → HFY. SUN → S(18)+5=23=X, U(20)+5=25=Z, N(13)+5=18=S → XZS.",
      status: "submitted",
      marks: null,
      feedback: null
    },
    {
      studentId: "s2",
      milestoneId: "m1",
      response: "H becomes K because H is the 8th letter and K is the 11th letter, so it moved 3 places. E becomes H. L becomes O. L becomes O. O becomes R. So HELLO with key 3 is KHOOR.",
      status: "submitted",
      marks: null,
      feedback: null
    },
    {
      studentId: "s4",
      milestoneId: "m1",
      response: "Shifting HELLO by 3: H(7)+3=10=K, E(4)+3=7=H, L(11)+3=14=O, L(11)+3=14=O, O(14)+3=17=R. Encoded word: KHOOR. Rule: add 3 to the position of each letter. After Z(25) we go back to A(0) using mod 26.",
      status: "graded",
      marks: 15,
      feedback: "Perfect. Showed position numbers clearly and used the correct modulo concept."
    },
    {
      studentId: "s4",
      milestoneId: "m2",
      response: "1. Assign each letter a number: A=0, B=1, ..., Z=25. 2. For each letter, get its number. 3. Add the secret key to the number. 4. Use modulo 26: new position = (letter number + key) mod 26. 5. Convert the new position back to a letter. 6. Repeat for all letters. Spaces stay as spaces.",
      status: "graded",
      marks: 20,
      feedback: "Outstanding. The modulo formula is exactly right and you correctly handled spaces. Full marks."
    },
    {
      studentId: "s4",
      milestoneId: "m3",
      response: "Key = 5. MANGO → M(12)+5=17=R, A(0)+5=5=F, N(13)+5=18=S, G(6)+5=11=L, O(14)+5=19=T → RFSLT. TIGER → T(19)+5=24=Y, I(8)+5=13=N, G(6)+5=11=L, E(4)+5=9=J, R(17)+5=22=W → YNLJW. RAIN → R(17)+5=22=W, A(0)+5=5=F, I(8)+5=13=N, N(13)+5=18=S → WFNS.",
      status: "graded",
      marks: 19,
      feedback: "All three conversions are correct and clearly shown. Excellent work."
    },
    {
      studentId: "s4",
      milestoneId: "m4",
      response: "Decode algorithm: 1. Get the position of the encoded letter. 2. Subtract the key. 3. If the result is negative, add 26. 4. Convert back to a letter. Testing with MJQQT key 5: M(12)-5=7=H, J(9)-5=4=E, Q(16)-5=11=L, Q(16)-5=11=L, T(19)-5=14=O → HELLO. The original word was HELLO.",
      status: "graded",
      marks: 24,
      feedback: "Correct decode algorithm and verified with MJQQT → HELLO. One small note: explicitly state the mod 26 wrap for negative numbers."
    },
    {
      studentId: "s4",
      milestoneId: "m5",
      response: "Strategy: try every key from 1 to 25 and check if the decoded text looks like English. For KHOOR: key 1 gives JGNNQ, key 2 gives IFMMP, key 3 gives HELLO — that's a real word! So the key is 3 and the original message is HELLO.",
      status: "submitted",
      marks: null,
      feedback: null
    },
    {
      studentId: "s5",
      milestoneId: "m1",
      response: "H shifted by 3 is K. E shifted by 3 is H. L shifted by 3 is O. L shifted by 3 is O. O shifted by 3 is R. So HELLO becomes KHOOR with a shift of 3.",
      status: "graded",
      marks: 12,
      feedback: "Correct result but missing the position numbers. Show the arithmetic (e.g. H=7, 7+3=10=K) to demonstrate you understand the underlying rule."
    },
    {
      studentId: "s5",
      milestoneId: "m2",
      response: "To encode a message: first write out the alphabet. Then for each letter move it forward by the key number. Write the new letter down. Do this for all letters in the message.",
      status: "submitted",
      marks: null,
      feedback: null
    }
  ]
};
