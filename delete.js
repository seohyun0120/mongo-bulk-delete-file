const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/welsh';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let total = 0;

async function deleteImageFiles() {
  try {
    await client.connect();
    console.log('Connected MongoDB!');
    const db = client.db();

    const query = { fileName: /\.png$/ };
    const batchSize = 10;

    const fileInfoCollection = db.collection('file');
    const chunkCollection = db.collection('fs.chunks');
    const fileCollection = db.collection('fs.files');

    let count = 1;
    while (true) {
      let cursor = fileInfoCollection.find(query).project({ fileStoredId: 1, fileName: 1 });
      const batch = await cursor.limit(batchSize).toArray();
      if (batch.length === 0) return;

      console.log(`loop - ${count} - batch length - ${batch.length}`);
      batch.map((doc) => {
        console.log(`doc: fileStoredId - ${doc.fileStoredId} fileName - ${doc.fileName}`);
      });

      // add deleteMany query to 'fs.chunks', 'fs.files', 'file'
      let fileDelete = await fileInfoCollection.deleteMany({ fileStoredId: { $in: batch.map(doc => doc.fileStoredId) } });
      await chunkCollection.deleteMany({ files_id: { $in: batch.map(doc => doc.fileStoredId) } });
      await fileCollection.deleteMany({ _id: { $in: batch.map(doc => doc.fileStoredId) } })
      count++;
      total += fileDelete.deletedCount;
    }
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  } finally {
    console.log(`${total} files deleted`);
    console.log('Finished. close db connection.');
    client.close();
  }
}

deleteImageFiles();