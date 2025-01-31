import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/testdata', (req: Request, res: Response) => {

    const filename = path.join(__dirname, "../testdata.json");

  // Read the file asynchronously
  fs.readFile(filename, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading data');
    }

    // Send the file content as the response
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
