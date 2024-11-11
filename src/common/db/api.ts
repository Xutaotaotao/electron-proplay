import Datastore from 'nedb';

interface Document {
  _id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

class Database {
  private db: Datastore;

  constructor(filename: string) {
    this.db = new Datastore({ filename, autoload: true });
  }

  insert(doc: Document): Promise<Document> {
    return new Promise((resolve, reject) => {
      this.db.insert(doc, (err, newDoc) => {
        if (err) {
          reject(err);
        } else {
          resolve(newDoc);
        }
      });
    });
  }

  find(query: Partial<Document>): Promise<Document[]> {
    return new Promise((resolve, reject) => {
      this.db.find(query, (err:Error, docs:Document[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
    });
  }

}

export default Database;
