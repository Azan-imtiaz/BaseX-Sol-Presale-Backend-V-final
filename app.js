require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL;
mongoose.connect(DB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('MongoDB connection error:', err));


const transactionSchema = new mongoose.Schema({
    evmAddress: { type: String, required: true },
    solAddress: { type: String, required: true },
    amount: { type: Number, required: true },
    tokenRecieved: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});


const Record = mongoose.model('Record', transactionSchema);
app.post('/save-record', async (req, res) => {
    const { evmAddress, solAddress, amount,tokenRecieved } = req.body;
    console.log('Received data:', req.body);  
    if (!evmAddress || !solAddress || !amount || !tokenRecieved ) {
        return res.status(400).json({ success: false, message: 'EVM address, Solana address, and amount are required.' });
    }

    try {
    
        const existingRecord = await Record.findOne({ evmAddress });

        if (existingRecord) {
          
            existingRecord.amount += amount;
            existingRecord.tokenRecieved += tokenRecieved;
            existingRecord.solAddress = solAddress;
            await existingRecord.save(); 
            console.log('Record updated with new amount:', existingRecord);
            return res.status(200).json({ success: true, message: 'Record updated successfully.' });
        } else {
            
            const newRecord = new Record({ evmAddress, solAddress, amount,tokenRecieved });
            await newRecord.save();  
            console.log('New record saved:', newRecord);
            return res.status(200).json({ success: true, message: 'Record details saved successfully.' });
        }
    } catch (err) {
        console.error('Error saving Record:', err); 
        return res.status(500).json({ success: false, message: 'Failed to save Record details.' });
    }
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
