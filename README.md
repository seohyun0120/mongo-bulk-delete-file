# mongo-bulk-delete-file
This repository contains a method for efficiently deleting numerous files stored in MongoDB. Uses GridFS to randomly generate image files (`.png`) and text files (`.txt`). In MongoDB, use GridFS for storing files larger than 16 MB. GridFS stores files in two collections `fs.chunks`, `fs.files`. Our goal is to find only image files(`.png`) among numerous documents and delete them all in both two collections.

If you only want to see how to delete them, jump to number 6.

## 1. DB Setting
Make your own test database. If you have one, just move on to next step.

I am currently running MongoDB with docker.
```
$ docker-compose up -d
```

Check our container is running: `mongod-db`
```
$ docker ps -a
CONTAINER ID   IMAGE         COMMAND                  CREATED          STATUS          PORTS                      NAMES
b006de62514e   mongo:4.2.3   "docker-entrypoint.s…"   39 minutes ago   Up 38 minutes   0.0.0.0:27017->27017/tcp   mongo-db
```

## 2. Generate files and upload
Open `upload.js`. Fix below code information with your own database.
```
const uri = 'mongodb://HOSTNAME:PORT/DATABASENAME';
```

- Connect to MongoDB.
- Upload either image file or text file.
    - Under files directory there are two example files. With these files, we will upload numerous files with different filenames.
    - Check the commented code section.
- Create a collection `file`, record uploaded file info.
    - fileName: name of file
    - uploadDate: timestamp of uploaded date.
    - size: size of file
    - fileStoredId: The unique ObjectId of the chunk.
    ```
    {
        "_id" : ObjectId("644f6e693ced40b523eb4e6b"),
        "fileName" : "a_1682927209236.txt",
        "uploadDate" : 1682927209236.0,
        "size" : 261120,
        "fileStoredId" : ObjectId("644f6e693ced40b523eb4e69")
    }
    ```
- Run `upload.js`
    - Run as much as you can to test delete.
    ```
    $ node upload.js
    Connected MongoDB!
    Upload Files
    File uploaded successfully!
    fileInfo: {"fileName":"test2_1682930059531.png","uploadDate":1682930059531,"size":261120,"fileStoredId":"644f798ba08b56e03e07a15f"}
    insertOne done
    File uploaded successfully!
    fileInfo: {"fileName":"test2_1682930059546.png","uploadDate":1682930059546,"size":261120,"fileStoredId":"644f798ba08b56e03e07a162"}
    insertOne done
    Finished. close db connection.
    ```
