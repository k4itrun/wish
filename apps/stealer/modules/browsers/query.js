const fs = require('fs/promises');
const sqlite3 = require('sqlite3').verbose();

class SqliteQuery {
  constructor(path) {
    this.path = path;
    this.pathTmpQuery = `${path}.query`;
    this.db = null;
  }

  async Execute(query) {
    try {
      await fs.copyFile(this.path, this.pathTmpQuery);
      this.db = new sqlite3.Database(this.pathTmpQuery);

      const data = await new Promise((resolve, reject) => {
        this.db.all(query, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      return data;
    } catch (error) {
      throw error;
    } finally {
      if (this.db) {
        this.db.close();
      }

      try {
        await fs.unlink(this.pathTmpQuery);
      } catch (_error) {}
    }
  }
}

module.exports = {
  SqliteQuery,
};
