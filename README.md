# mongo-upload-delete-file
This repository contains a method for efficiently deleting numerous files stored in MongoDB. Uses GridFS to randomly generate image files (`.png`) and text files (`.txt`). In MongoDB, use GridFS for storing files larger than 16 MB. GridFS stores files in two collections `fs.chunks`, `fs.files`. Our goal is to find only image files(`.png`) among numerous documents and delete them all in both two collections.

If you only want to see how to delete them, jump to `step 3 and 4`.

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

## 3. Delete files - javascript version
There are many ways to delete document in MongoDB. `deleteOne`, `deleteMany`, `drop database` etc. This time we will use `deleteMany`.
- Create a cursor. In MongoDB, a cursor is a pointer to the result set of a query. We will query a file that fileName ends with `.png`.
- Use `limit` option. The maximum value of limit() for a MongoDB cursor is 2147483647 but it's generally a good practice to use limit() to retrieve a reasonable number of documents at a time, and use pagination if you need to retrieve additional documents.
- With `fileStoredId`, find files that are stored in `fs.chunks`, `fs.files` collection.
- Delete them with `deleteMany` method.

- Run `delete.js`
```
$ node delete.js
Connected MongoDB!
loop - 1 - batch length - 10
doc: fileStoredId - 644f8444a9c885fbdb250279 fileName - test2_1682932804837.png
doc: fileStoredId - 644f8444a9c885fbdb25027c fileName - test2_1682932804851.png
...
loop - 10 - batch length - 10
doc: fileStoredId - 644f844b73678206ad735a9d fileName - test2_1682932811753.png
doc: fileStoredId - 644f844b73678206ad735aa0 fileName - test2_1682932811768.png
100 files deleted
Finished. close db connection.
```

## 4. Delete files - mongo shell version
- copy shell script to docker volume
    - check out `docker-compose.yml` volumes section
    ```YAML
    ...
    volumes:
        - ./delete-image-file.sh:/scripts/delete_image_files.sh
    ...
    ```
    - You can also just copy with command
    ```
    $ docker cp delete-image-file.sh mongo-db:/scripts/delete-image-file.sh
    ```
- run shell command
    ```
    $ docker exec -it mongo-db bash
    $ cd scripts
    $ mongo < delete-image-file.bash
    ```

    ```
    root@b006de62514e:/scripts# mongo <delete_image_files.sh
    MongoDB shell version v4.2.3
    connecting to: mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb
    Implicit session: session { "id" : UUID("1504248b-7546-4f8e-9f9c-6daac0e11d64") }
    MongoDB server version: 4.2.3
    switched to db welsh
    use welsh dabatase
    delete all files that end with .png
    loop - 1: batch size - 10
    doc: fileStoredId - ObjectId("644f7d7f32aa5dc26b4779ad") fileName - test2_1682931071957.png
    doc: fileStoredId - ObjectId("644f7d7f32aa5dc26b4779b0") fileName - test2_1682931071972.png
    doc: fileStoredId - ObjectId("644f7d7f32aa5dc26b4779b3") fileName - test2_1682931071977.png
    doc: fileStoredId - ObjectId("644f7d7f32aa5dc26b4779b6") fileName - test2_1682931071984.png
    doc: fileStoredId - ObjectId("644f7d7f32aa5dc26b4779b9") fileName - test2_1682931071990.png
    doc: fileStoredId - ObjectId("644f7d7f32aa5dc26b4779bc") fileName - test2_1682931071994.png
    doc: fileStoredId - ObjectId("644f7d7f32aa5dc26b4779bf") fileName - test2_1682931071999.png
    doc: fileStoredId - ObjectId("644f7d8032aa5dc26b4779c2") fileName - test2_1682931072004.png
    doc: fileStoredId - ObjectId("644f7d8032aa5dc26b4779c5") fileName - test2_1682931072007.png
    doc: fileStoredId - ObjectId("644f7d8032aa5dc26b4779c8") fileName - test2_1682931072010.png
    10files deleted
    bye
    ```