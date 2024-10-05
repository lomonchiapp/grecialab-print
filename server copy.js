const escpos = require('escpos');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS
// Set up the USB printer
escpos.USB = require('escpos-usb');


app.post('/print', (req, res) => {
  const printData = req.body.data; // Data from the request (e.g., receipt content)

  if (!printData) {
    console.error('No print data provided');
    return res.status(400).send('No print data provided');
  }

  const printString = typeof printData === 'object' ? JSON.stringify(printData, null, 2) : printData;

  const device = new escpos.USB();
  const printer = new escpos.Printer(device);

  device.open((err) => {
    if (err) {
      console.error('Failed to open device:', err);
      return res.status(500).send('Printer connection error');
    }

    console.log('Device opened successfully');

    printer
    .align('CT') // Center align
    .style('B') // Bold text
    .size(4, 4) // Normal size text
    .text('--- TICKET DE TURNO ---')
    .style('NORMAL').align('CT') // Normal text
    .text(printString).align('CT')
    .cut()
    .close(() => {
      console.log('Print job completed');
      res.status(200).send('Print job completed');
    });
});
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});