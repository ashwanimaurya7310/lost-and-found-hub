import { adminDb } from '@/lib/firebase-admin';
import type { Item } from '@/lib/types';

const ITEMS_COLLECTION = 'items';

export async function getFirestoreItems(): Promise<Item[]> {
    const snapshot = await adminDb
        .collection(ITEMS_COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map((doc) => doc.data() as Item);
}

export async function addFirestoreItem(item: Item): Promise<Item> {
    await adminDb
        .collection(ITEMS_COLLECTION)
        .doc(item.id)
        .set(item);

    return item;
}

export async function updateFirestoreItem(
    id: string,
    updates: Partial<Item>
): Promise<Item | null> {
    const docRef = adminDb.collection(ITEMS_COLLECTION).doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
        return null;
    }

    await docRef.update(updates);

    const updated = await docRef.get();
    return updated.data() as Item;
}

export async function deleteFirestoreItem(id: string): Promise<boolean> {
    const docRef = adminDb.collection(ITEMS_COLLECTION).doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
        return false;
    }

    await docRef.delete();
    return true;
}