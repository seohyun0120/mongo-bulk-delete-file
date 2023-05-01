const fs = require('fs');
const { MongoClient, GridFSBucket } = require('mongodb');

const uri = 'mongodb://HOSTNAME:PORT/DATABASENAME';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Change value how much files to create
const count = 10;

async function uploadfile() {
  try {
    await client.connect();
    console.log('Connected MongoDB!');

    const db = client.db();
    const bucket = new GridFSBucket(db);

    console.log('Upload Files');``
    for (let i = 0; i < count; i++) {
      const timestamp = Date.now();
      // const filePath = './files/a.txt';
      // const fileName = `a_${timestamp}.txt`;
      const filePath = './files/test.png';
      const fileName = `test2_${timestamp}.png`;
      
      const uploadStream = bucket.openUploadStream(fileName);
      const fileStream = fs.createReadStream(filePath);

      let fileInfo = {
        fileName: fileName,
        uploadDate: timestamp,
      }

      const stream = new Promise((resolve, reject) => {
        fileStream.pipe(uploadStream)
          .on('error', (err) => console.error('Failed to upload file: ', err))
          .on('finish', () => {
            console.log('File uploaded successfully!');
            fileInfo.size = uploadStream.chunkSizeBytes;
            fileInfo.fileStoredId = uploadStream.id;
            resolve(fileInfo);
          });
      })

      fileInfo = await stream;
      console.log(`fileInfo: ${JSON.stringify(fileInfo)}`);
      const fileInfoCollection = db.collection('file');
      await fileInfoCollection.insertOne(fileInfo);
      console.log(`insertOne done`);
    }
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  } finally {
    console.log('Finished. close db connection.')
    client.close();
  }
}

uploadfile();