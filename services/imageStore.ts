import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'CreatorNexusDB';
const STORE_NAME = 'ImageStore';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

const initDB = (): Promise<IDBPDatabase> => {
    if (dbPromise) return dbPromise;
    dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
    return dbPromise;
};

export const setImage = async (key: string, value: string): Promise<void> => {
    const db = await initDB();
    await db.put(STORE_NAME, value, key);
};

export const getImage = async (key: string): Promise<string | undefined> => {
    const db = await initDB();
    return await db.get(STORE_NAME, key);
};

export const deleteImages = async (keys: string[]): Promise<void> => {
    if (keys.length === 0) return;
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await Promise.all([...keys.map(key => tx.store.delete(key)), tx.done]);
};
