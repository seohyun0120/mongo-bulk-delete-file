use welsh
print("use welsh dabatase");

var fileInfoCollection = db.getCollection('file');
var chunkCollection = db.getCollection('fs.chunks');
var fileCollection = db.getCollection('fs.files');
var count = 1;
var total = 0;
var batchSize = 30;
var query = { fileName: /\.png$/ };
print("delete all files that end with .png");

while (true) {
  var cursor = fileInfoCollection.find(query, { fileStoredId: 1, fileName: 1  });
  var batch = cursor.limit(batchSize).toArray();
  if (batch.length === 0) break;

  print(`loop - ${count}: batch size - ${batch.length}`);

  batch.forEach(function(doc) {
    print(`doc: fileStoredId - ${doc.fileStoredId} fileName - ${doc.fileName}`);
  });

  var fileDelete = fileInfoCollection.deleteMany({ fileStoredId: { $in: batch.map(doc => doc.fileStoredId) } });
  chunkCollection.deleteMany({ files_id: { $in: batch.map(doc => doc.fileStoredId) } });
  fileCollection.deleteMany({ _id: { $in: batch.map(doc => doc.fileStoredId) } })

  count++;
  total+= fileDelete.deletedCount;
}

print(total + "files deleted");